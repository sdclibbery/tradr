const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

const bot = async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()
    logger.warn(`BOT: New price: ${newPrice} ${quoteCurrency} per ${baseCurrency}`)
  }
}
bot().then(() => { process.exit() })
