const framework = require('./framework')
const {ema} = require('./exponential-moving-average')

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

const makeEmaChangeBot = (ema, transactionFilter) => {
  let quoteBalance = 0
  let baseBalance = 0
  let lastValue
  let lastDirection
  let lastSide
  let lastTransactionPrice
  let transactionCount = 0
  const update = (price) => {
    const value = ema.value
    if (lastValue) {
      const delta = value - lastValue
      const direction = (delta < 0) ? 'Down' : 'Up'
      const side = (delta < 0) ? 'Sell' : 'Buy'
      const changedDirection = lastDirection && lastDirection != direction
      if (changedDirection && transactionFilter(side, lastSide, price, lastTransactionPrice)) {
        if (side == 'Buy') {
          quoteBalance -= price
          baseBalance += 1
        }
        if (side == 'Sell'){
          quoteBalance += price
          baseBalance -= 1
        }
//        logger.debug(`${side}! makeEmaChangeBot(${ema.count}) at ${price}; quoteBalance ${quoteBalance}`)
        transactionCount++
        lastTransactionPrice = price
        lastSide = side
      }
      lastDirection = direction
    }
    lastValue = value
    const equivalentBalance = quoteBalance + baseBalance * price
    return `emaChangeBot-${ema.count}  \tbalance: ${exchange.formatQuote(equivalentBalance)}\ttransactionCount ${transactionCount}`
  }
  return update
}

const noLossFilter = (side, lastSide, price, lastTransactionPrice) => {
  if (!lastTransactionPrice) { return true }
  if (lastSide && lastSide == side) { return false }
  if (side == 'Buy') {
    return price < lastTransactionPrice
  }
  if (side == 'Sell') {
    return price > lastTransactionPrice
  }
}

framework.runBot(async () => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const emas = [5,10,15,20,30,40,60,90,150].map(count => { return { count:count, update:ema(count) } })
  const bots = emas.map(ema => makeEmaChangeBot(ema, () => true))
    .concat(emas.map(ema => makeEmaChangeBot(ema, noLossFilter)))

  const startTimeEpoch = Date.now() - 300*60*1000
  const startTime = new Date(startTimeEpoch)
  const beforeStartTime = new Date(startTimeEpoch - 300*60*1000)
  const endTime = new Date(startTimeEpoch + 300*60*1000)
  logger.warn(`Starting tests with ${options.product}\nTest period: ${startTime} - ${endTime}`)

  const oldCandles = await exchange.candles({startTime: beforeStartTime, count: 300, granularity: 60})
  const newCandles = await exchange.candles({startTime: startTime, count: 300, granularity: 60})
  const candles = newCandles.concat(oldCandles)

  let statuses = []
  for (let i = 299; i >= 0; i--) {
    const candlesNow = candles.slice(i, i+300)
    emas.map(ema => ema.value = ema.update(candlesNow))
    const priceNow = candlesNow[0].close
    statuses = bots.map(bot => bot(priceNow))
  }
  logger.warn('Bot status:\n'+statuses.join('\n'))
}, logger)
