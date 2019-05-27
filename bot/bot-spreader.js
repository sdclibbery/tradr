const assert = require('assert')
const coinbasePro = require('coinbase-pro')
const exchangeFactory = require('../coinbasepro-exchange')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')
let credentials
try { credentials = require('../coinbasepro-account-credentials') } catch (e) {}

const logger = loggerFactory.createLogger(`${process.argv[1]}.log`)
logger.debug = () => {}
optionDefinitions = [
  { name: 'amount', alias: 'a', type: Number, defaultValue: 0.002, description: 'amount to bot with in base currency (eg BTC)' },
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
const client = new coinbasePro.PublicClient()
const orderbookSync = new coinbasePro.OrderbookSync(
  [product],
  'https://api.pro.coinbase.com',
  'wss://ws-feed.pro.coinbase.com',
  credentials
)
exchangeFactory.ready().then(() => {
const exchange = exchangeFactory.createExchange(options, logger, orderbookSync)
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
const orders = {buy:{}, sell:{}}
const recent = []
const amountInBase = () => parseFloat(options.amount)/2
const amountInQuote = () => recent[0]&&options.amount*recent[0].price
const minSpreadToTrade = () => Math.ceil(amountInQuote())*0.2
const minProfit = () => Math.ceil(amountInQuote())*0.01
logger.info(`BOT: Spreader starting for ${product} with ${amountInBase()}${baseCurrency}`)
orderbookSync.on('message', (m) => {
  if (m.type == 'match') {
    // Own orders filled?
    if (orders.buy.id == m.maker_order_id) {
      exchange.orderStatus(orders.buy.id).then(({filled, price}) => {
        if (filled) {
          orders.buy = {}
          orders.sellLimit = parseFloat(price) + minProfit() // Set limit on how far the other side can track to avoid making a loss
          orders.buyPrice = parseFloat(price)
          orders.buyFees = orders.buyPrice*amountInBase()*0.0015
          logger.info(`BOT: buy filled ${dp2(parseFloat(price))}; sell limit > ${dp2(orders.sellLimit)}`)
          if (!orders.sell.price) { // Both filled
            const made = orders.sellPrice*amountInBase() - orders.buyPrice*amountInBase()
            const fees = orders.buyFees + orders.sellFees
            logger.info(`Both filled ${dp2(orders.sellPrice)}-${dp2(orders.buyPrice)}, made ${dp2(made)}, fees ${dp2(fees)}\n profit ${dp2(made-fees)}${quoteCurrency}`)
          }
        }
      }).catch(e => {})
    } else if (orders.sell.id == m.maker_order_id) {
      exchange.orderStatus(orders.sell.id).then(({filled, price}) => {
        if (filled) {
          orders.sell = {}
          orders.buyLimit = parseFloat(price) - minProfit() // Set limit on how far the other side can track to avoid making a loss
          orders.sellPrice = parseFloat(price)
          orders.sellFees = orders.sellPrice*amountInBase()*0.0015
          logger.info(`BOT: sell filled ${dp2(parseFloat(price))}; buy limit < ${dp2(orders.buyLimit)}`)
          if (!orders.buy.price) { // Both filled
            const made = orders.sellPrice*amountInBase() - orders.buyPrice*amountInBase()
            const fees = orders.buyFees + orders.sellFees
            logger.info(`Both filled ${dp2(orders.sellPrice)}-${dp2(orders.buyPrice)}, made ${dp2(made)}, fees ${dp2(fees)}\n profit ${dp2(made-fees)}${quoteCurrency}`)
          }
        }
      }).catch(e => {})
    } else {
      // Remember recent trades
      recent.unshift({price:parseFloat(m.price), side:m.side})
      if (recent.length > 5) { recent.pop() }
    }
  }
  // Get spread
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
  process.stdout.write(`${green}${dp2(spread.bid)}${reset} - ${red}${dp2(spread.ask)}${reset} (${dp2(spread.ask - spread.bid)})`+
    ` \t${fmtRecent(recent[0])} ${recent.map(r => r&&(r.side=='buy'?red+'▼':green+'▲')).join('')}${reset}`+
    ` \t${dp2(orders.buy.price)}-${dp2(orders.sell.price)} ${dp2(orders.buyLimit)}-${dp2(orders.sellLimit)}`+
    `     \r`)
  // Helpers for buying and selling
  const buyPrice = () => spread.bid// + exchange.quoteStep
  const sellPrice = () => spread.ask// - exchange.quoteStep
  const buy = () => {
    orders.buy = { price: buyPrice() }
    exchange
      .buy(amountInBase(), orders.buy.price, 'spreader bot', `buy with spread ${dp2(spread.bid)} - ${dp2(spread.ask)}`)
      .then(({id}) => orders.buy.id = id)
      .catch(e => {})
  }
  const sell = () => {
    orders.sell = { price: sellPrice() }
    exchange
      .sell(amountInBase(), orders.sell.price, 'spreader bot', `sell with spread ${dp2(spread.bid)} - ${dp2(spread.ask)}`)
      .then(({id}) => orders.sell.id = id)
      .catch(e => {})
  }
  // Track any existing orders against spread edges
  if (orders.buy.id && orders.buy.price != buyPrice() && buyPrice() <= orders.buyLimit) {
    logger.info(`BOT: moving buy from ${dp2(orders.buy.price)} to ${dp2(buyPrice())}`)
    exchange.cancelOrder(orders.buy.id).then(buy).catch(e => {})
    orders.buy.id = undefined
  }
  if (orders.sell.id && orders.sell.price != sellPrice() && sellPrice() >= orders.sellLimit) {
    logger.info(`BOT: moving sell from ${dp2(orders.sell.price)} to ${dp2(sellPrice())}`)
    exchange.cancelOrder(orders.sell.id).then(sell).catch(e => {})
    orders.sell.id = undefined
  }
  // Before placing new orders, require price volatility (ie recent orders include both spread edges) and spread > 1% of trade amount
  if (recent.length < 2) {return}
  if (!recent.some(r => r && r.side=='buy')) {return}
  if (!recent.some(r => r && r.side=='sell')) {return}
  if ((spread.ask - spread.bid) < minSpreadToTrade()) {return}
  // Place new orders
  if (!orders.buy.price && !orders.sell.price) {
    orders.buyLimit = Infinity
    orders.sellLimit = 0
    logger.info(`BOT:  buy in at ${dp2(buyPrice())}`)
    buy()
    logger.info(`BOT:  sell in at ${dp2(sellPrice())}`)
    sell()
  }
})
})
