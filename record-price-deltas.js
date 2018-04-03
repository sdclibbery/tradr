const GdaxExchange = require('./gdax-exchange')

const options = {
  product: 'BTC-EUR',
}
const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}
const exchange = GdaxExchange.createExchange(options, logger)

const bot = async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  let lastPrice
  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()
    const delta = newPrice - lastPrice
    lastPrice = newPrice
    if (delta) {
      require('fs').writeFileSync(options.product+'-price-deltas', exchange.roundQuote(delta)+'\n', {flag: 'a'})
    }
  }
}
bot()
.then(process.exit)
.catch(e => {
  console.log('error: ', e)
  process.exit()
})
