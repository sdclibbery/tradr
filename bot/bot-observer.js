const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  logger.info(`BOT: observing ${options.product}`)
  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()
    logger.info(`BOT: New price: ${exchange.formatQuote(newPrice)} per ${baseCurrency}`)
  }
})
.then(framework.close)
.catch(framework.handleError)
