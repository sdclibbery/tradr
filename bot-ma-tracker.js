const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'close', alias: 'c', type: Number, defaultValue: 10, description: 'number of minutes to average together for the close moving average (up to 300)' },
  { name: 'far', alias: 'f', type: Number, defaultValue: 15, description: 'number of minutes to average together for the far moving average (up to 300)' },
])

framework.runBot(async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  const candlePrice = c => (c.low+c.high)/2
  const movingAverage = (candles, count) => candles.slice(0, count).reduce((acc, c) => acc+candlePrice(c), 0) / count
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  let lastDirection
  let tempBalanceForTesting = 0
  while (true) {
    const candles = await exchange.candles()
    const closeMa = movingAverage(candles, options.close)
    const farMa = movingAverage(candles, options.far)
    const direction = closeMa>farMa ? 'Up' : 'Down'
    logger.debug(`close ma: ${closeMa}  far ma: ${farMa} direction ${direction}`)

    if (lastDirection && direction !== lastDirection) {
      const price = candlePrice(candles[0])
      logger.info(`Direction change to ${direction}! at price ${price}; close ma: ${closeMa}  far ma: ${farMa}`)
      if (direction == 'Up') {
        tempBalanceForTesting -= price
        logger.info(`Buy! tempBalanceForTesting: ${tempBalanceForTesting}`)
      } else {
        tempBalanceForTesting += price
        logger.info(`Buy! tempBalanceForTesting: ${tempBalanceForTesting}`)
      }
    }

    lastDirection = direction
    await sleep(60*1000)
  }
}, logger)
