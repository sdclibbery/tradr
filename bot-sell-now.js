const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: String, description: "amount to sell with units, eg '0.01 BTC' or '100 EUR'" },
])

framework.runBot(async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const amount = options.amount.split(' ')[0]
  const currency = options.amount.split(' ')[1]
  const amountOfBase = currency == baseCurrency ? amount : undefined
  const amountOfQuote = currency == quoteCurrency ? amount : undefined

  const dp4 = (x) => Number.parseFloat(x).toFixed(2)

  const {size, price} = await exchange.sellNow(amountOfBase, amountOfQuote)
  logger.sync.info(`BOT: sold ${dp4(size)} ${baseCurrency} at ${dp4(price)} ${quoteCurrency}`)
}, logger)