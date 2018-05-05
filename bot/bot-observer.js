const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

try {
  framework.runBot(async () => {
    const baseCurrency = options.product.split('-')[0]
    const quoteCurrency = options.product.split('-')[1]
    logger.info(`BOT: observing ${options.product}`)
    while (true) {
      const {price: newPrice} = await exchange.waitForPriceChange()
      logger.info(`BOT: New price: ${exchange.formatQuote(newPrice)} per ${baseCurrency}`)
    }
  }, logger)
} catch (e) { logger.error("bot-observer: ERROR: ", e) }
