const assert = require('assert')
const coinbasePro = require('coinbase-pro')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')
let credentials
try { credentials = require('../coinbasepro-account-credentials') } catch (e) {}

const logger = loggerFactory.createLogger(`${process.argv[1]}.log`)
optionDefinitions = [
  { name: 'amount', alias: 'a', type: Number, defaultValue: '20', description: 'amount to bot with in quote currency (eg GBP)' },
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
const amount = parseFloat(options.amount)
const minSpreadToTrade = amount*0.01

const dp2 = (x) => Number.parseFloat(x).toFixed(2)
const red   = "\033[1;31m"
const green = "\033[0;32m"
const reset = "\033[0;0m"
const fmtRecent = r => (!r)?'-':`${r.side=='buy'?red:green}${dp2(r.price)}${reset}`
logger.info(`BOT: Spreader starting for ${product} with ${amount}${quoteCurrency}; min spread to trade ${minSpreadToTrade}${quoteCurrency}`)
const client = new coinbasePro.PublicClient()
const orderbookSync = new coinbasePro.OrderbookSync(
  [product],
  'https://api.pro.coinbase.com',
  'wss://ws-feed.pro.coinbase.com',
  credentials
)
const orderBook = orderbookSync.books[product]
// Monkey patch to fix the desync issue (https://github.com/coinbase/coinbase-pro-node/issues/308)
const oldOrderBookStateMethod = orderBook.state
orderBook.state = function (book) {
  if (book) {
    this._asks.clear()
    this._bids.clear()
  }
  oldOrderBookStateMethod.call(this, book)
}
// End of monkey patch
const spread = {ask:0, bid:0}
const recent = []
const lastHeartbeat = undefined
orderbookSync.on('message', (m) => {
  if (m.type == 'heartbeat' && lastHeartbeat <= m.sequence) {
    logger.warn('BOT: resyncing ${lastHeartbeat} != ${m.sequence}')
    orderBook._asks.clear()
    orderBook._bids.clear()
    orderbookSync.loadOrderbook(product)
    lastHeartbeat = m.sequence
  }
  if (m.type == 'match') {
    recent.unshift({price:parseFloat(m.price), side:m.side})
    if (recent.length > 10) { recent.pop() }
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
    `${fmtRecent(recent[0])} ${recent.map(r => r&&(r.side=='buy'?red+'▼':green+'▲')).join('')}${reset}  \r`)
  // Requires price volatility (ie recent orders include both spread edges) and spread > 1% of trade amount
  if (recent.length < 2) {return}
  if (!recent.some(r => r&&r.side=='buy')) {return}
  if (!recent.some(r => r&&r.side=='sell')) {return}
  if ((spread.ask - spread.bid) < minSpreadToTrade) {return}
  process.stdout.write('\n')
  logger.info(`bottable: ${spread.ask - spread.bid} ${recent[0].price}`)
})
