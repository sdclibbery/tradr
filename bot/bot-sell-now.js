const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: String, description: "amount to sell with units, eg '0.01_BTC' or '100_EUR'" },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const amount = options.amount.split('_')[0]
  const currency = options.amount.split('_')[1]
  const amountOfBase = currency == baseCurrency ? amount : undefined
  const amountOfQuote = currency == quoteCurrency ? amount : undefined

  const {size, price} = await exchange.sellNow(amountOfBase, amountOfQuote, 'sellNow bot', 'sell now at market price')
  logger.sync.info(`BOT: sold ${exchange.formatBase(size)} at ${exchange.formatQuote(price)}`)
})
.then(framework.close)
.catch(framework.handleError)
