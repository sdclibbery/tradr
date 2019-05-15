const assert = require('assert')
const coinbasePro = require('coinbase-pro')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')

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

const client = new coinbasePro.PublicClient()
const orderbookSync = new coinbasePro.OrderbookSync([product])
const orderBook = orderbookSync.books[product]
const spread = {ask:0, bid:0}
orderbookSync.on('message', () => {
  if (!orderBook._asks) {return}
  const minAsk = orderBook._asks.min()
  const maxBid = orderBook._bids.max()
  if (!minAsk) {return}
  if (!maxBid) {return}
  if (minAsk.price == spread.ask) {return}
  if (maxBid.price == spread.bid) {return}
  spread.ask = minAsk.price
  spread.bid = maxBid.price
  logger.info(`${spread.ask}  ${spread.bid}`)
  // Can check for width of spread here
  // Need to efficiently also get and sync recent trades through a websocket interface
})
