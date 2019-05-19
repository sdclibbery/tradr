const assert = require('assert')
const coinbasePro = require('coinbase-pro')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')
const credentials = require('../coinbasepro-account-credentials')

const logger = loggerFactory.createLogger(`${process.argv[1]}.log`)
optionDefinitions = [
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-GBP', description: 'coinbasepro product' },
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' },
]
let options
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  logger.sync.error(`Options error: ${e.toString()}\nOptionDefs: ${JSON.stringify(optionDefinitions)}\nCmd Line: ${process.argv}\n`)
}
const product = options.product
const baseCurrency = options.product.split('-')[0]
const quoteCurrency = options.product.split('-')[1]

logger.info(`Spreader starting for ${product}`)
const client = new coinbasePro.PublicClient()
const orderbookSync = new coinbasePro.OrderbookSync(
  [product],
  'https://api.pro.coinbase.com',
  'wss://ws-feed.pro.coinbase.com',
  credentials
)
const orderBook = orderbookSync.books[product]
const spread = {ask:0, bid:0}
const recent = []
orderbookSync.on('message', (m) => {
  if (m.type == 'match') {
    recent.unshift(parseFloat(m.price))
    if (recent.length > 20) { recent.pop() }
  }
  if (!orderBook._asks) {return}
  const minAsk = orderBook._asks.min()
  const maxBid = orderBook._bids.max()
  if (!minAsk) {return}
  if (!maxBid) {return}
  const ask = parseFloat(minAsk.price)
  const bid = parseFloat(maxBid.price)
  if (spread.ask === ask && spread.bid === bid) {return}
  spread.ask = ask
  spread.bid = bid
  logger.debug(`New spread: ${spread.ask} - ${spread.bid}  (${recent[0]})  ${recent.length}`)
  // Requires price volatility (ie recent orders include both spread edges) and >1% spread
})
