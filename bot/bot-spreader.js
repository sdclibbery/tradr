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
setInterval(() => {
  logger.info(`${orderBook._asks.min().price}  ${orderBook._bids.max().price}`)
  client.getProductTrades(product).then((recent) => {
    logger.info(`${JSON.stringify(recent[0], null, 2)}`)
  })
}, 2000)
