const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, description: 'GDAX product' },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  logger.info(`BOT: Filling in historic prices for ${options.product}`)
})
.then(framework.close)
.catch(framework.handleError)
