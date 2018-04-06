const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

framework.runBot(async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  const candlePrice = c => (c.low+c.high)/2
  const movingAverage = (candles, count) => candles.slice(0, count).reduce((acc, c) => acc+candlePrice(c), 0) / count
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  let lastDirection
  while (true) {
    const candles = await exchange.candles()
    const closeMa = movingAverage(candles, 5)
    const farMa = movingAverage(candles, 15)
    const direction = closeMa>farMa ? 'Up' : 'Down'
    logger.info(`${candles[0].time}: close: ${closeMa}  far: ${farMa}  ${direction}`)
    if (lastDirection && direction !== lastDirection) {
      logger.info(`Direction change to ${direction}! at price ${candlePrice(candles[0])}`)
    }
    lastDirection = direction
    await sleep(60*1000)
  }
}, logger)
