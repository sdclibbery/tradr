const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'deltas', alias: 'd', type: Boolean, defaultValue: false, description: 'Record price deltas to a file' },
])

framework.runBot(async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  let lastPrice
  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()
    logger.info(`BOT: New price: ${exchange.formatQuote(newPrice)} per ${baseCurrency}`)
    const delta = newPrice - lastPrice
    lastPrice = newPrice
    if (options.deltas && delta) {
      require('fs').writeFileSync(options.product+'-price-deltas', exchange.roundQuote(delta)+'\n', {flag: 'a'})
    }
  }
}, logger)
