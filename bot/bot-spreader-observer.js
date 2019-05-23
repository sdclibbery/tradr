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

const dp2 = (x) => Number.parseFloat(x).toFixed(2)
const red   = "\033[1;31m"
const green = "\033[0;32m"
const reset = "\033[0;0m"
const fmtRecent = r => (!r)?'-':`${r.side=='buy'?red:green}${dp2(r.price)}${reset}`
logger.info(`Spreader starting for ${product}`)
const client = new coinbasePro.PublicClient()
const orderbookSync = new coinbasePro.OrderbookSync(
  [product],
  'https://api.pro.coinbase.com',
  'wss://ws-feed.pro.coinbase.com'

)
const orderBook = orderbookSync.books[product]
const spread = {ask:0, bid:0}
const recent = []
orderbookSync.on('message', (m) => {
  if (m.type == 'match') {
    recent.unshift({price:parseFloat(m.price), side:m.side})
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
  process.stdout.write(`${green}${dp2(spread.bid)}${reset} - ${red}${dp2(spread.ask)}${reset} (${dp2(spread.ask - spread.bid)}) \t`+
    `${fmtRecent(recent[0])} ${fmtRecent(recent[1])} ${fmtRecent(recent[2])}  \r`)
})
