const framework = require('./framework')
const {ema} = require('../exponential-moving-average')

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'coinbasepro product' },
  { name: 'close', alias: 'c', type: Number, defaultValue: 20, description: 'number of minutes to average together for the close moving average (up to 300)' },
  { name: 'far', alias: 'f', type: Number, defaultValue: 30, description: 'number of minutes to average together for the far moving average (up to 300)' },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  logger.warn(`starting ${options.product} with close: ${options.close} mins, far: ${options.far} mins`)
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  let lastDirection
  let tempQuoteBalanceForTesting = 0
  let count = 0
  const nextCloseEma = ema(options.close)
  const nextFarEma = ema(options.far)
  while (true) {
    const candles = await exchange.candles({})
    const closeMa = nextCloseEma(candles)
    const farMa = nextFarEma(candles)
    const direction = closeMa>farMa ? 'Up' : 'Down'

    if (count % 5 == 0) {
      logger.info(`close ma: ${closeMa}  far ma: ${farMa} direction ${direction}`)
    }
    count++

    if (lastDirection && direction !== lastDirection) {
      const price = exchange.latestPrice()
      logger.warn(`Direction change to ${direction}! at price ${exchange.formatQuote(price)}; close ma: ${exchange.formatQuote(closeMa)}  far ma: ${exchange.formatQuote(farMa)}`)
      const fees = price * 0.25/100
      tempQuoteBalanceForTesting -= fees
      if (direction == 'Up') {
        tempQuoteBalanceForTesting -= price
        logger.warn(`Buy at ${exchange.formatQuote(price)}! tempQuoteBalanceForTesting: ${exchange.formatQuote(tempQuoteBalanceForTesting)} (fees: ${fees})`)
      } else {
        tempQuoteBalanceForTesting += price
        logger.warn(`Sell at ${exchange.formatQuote(price)}! tempQuoteBalanceForTesting: ${exchange.formatQuote(tempQuoteBalanceForTesting)} (fees: ${fees})`)
      }
    }

    lastDirection = direction
    await sleep(60*1000)
  }
})
.then(framework.close)
.catch(framework.handleError)
