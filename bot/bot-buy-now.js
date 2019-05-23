const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-GBP', description: 'coinbasepro product' },
  { name: 'amount', alias: 'a', type: String, description: "amount to buy with units, eg '0.01_BTC' or '100_EUR'" },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const amount = options.amount.split('_')[0]
  const currency = options.amount.split('_')[1]
  const amountOfBase = currency == baseCurrency ? amount : undefined
  const amountOfQuote = currency == quoteCurrency ? amount : undefined

  const {size, price} = await exchange.buyNow(amountOfBase, amountOfQuote, 'buyNow bot', 'buy now at market price')
  logger.sync.info(`BOT: bought ${exchange.formatBase(size)} at ${exchange.formatQuote(price)}`)
})
.then(framework.close)
.catch(framework.handleError)
