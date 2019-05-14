const coinbasepro = require('./coinbasepro-exchange')

const options = {
  product: 'BTC-EUR',
}
const logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}
const exchange = coinbasepro.createExchange(options, logger)

const bot = async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  const filename = options.product+'-price-deltas'
  let lastPrice
  while (true) {
    const {price: newPrice, time: time} = await exchange.waitForPriceChange()
    const delta = newPrice - lastPrice
    lastPrice = newPrice
    if (delta) {
      require('fs').writeFileSync(filename, `${time},${exchange.roundQuote(newPrice)},${exchange.roundQuote(delta)}\n`, {flag: 'a'})
    }
  }
}
bot()
.then(process.exit)
.catch(e => {
  console.log('error: ', e)
  process.exit()
})
