const framework = require('./framework')
const {ema} = require('./exponential-moving-average')

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

const makeEmaChangeBot = (ema) => {
  let balance = 0
  let lastValue
  let lastDirection
  let transactionCount = 0
  const update = (price) => {
    const value = ema.value
    if (lastValue) {
      const delta = value - lastValue
      const direction = (delta < 0) ? 'Down' : 'Up'
      if (lastDirection && lastDirection != direction) {
        if (direction == 'Up') {
          balance -= price
          transactionCount++
          console.log(`BUY! makeEmaChangeBot(${ema.count}) at ${price}; balance ${balance}`)
        } else {
          balance += price
          transactionCount++
          console.log(`SELL! makeEmaChangeBot(${ema.count}) at ${price}; balance ${balance}`)
        }
      }
      lastDirection = direction
    }
    lastValue = value
    const equivalentBalance = balance<1000 ? balance : balance-price
    return `emaChangeBot-${ema.count}  \tbalance: ${exchange.formatQuote(equivalentBalance)}\ttransactionCount ${transactionCount}`
  }
  return update
}

framework.runBot(async () => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const emas = [5,10,15,20,30,40,60,90,150].map(count => { return { count:count, update:ema(count) } })
  const bots = emas.map(makeEmaChangeBot)

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
