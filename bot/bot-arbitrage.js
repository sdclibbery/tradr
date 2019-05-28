const coinbasePro = require('coinbase-pro')
const exchangeFactory = require('../coinbasepro-exchange')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')

const products = [
  'BTC-GBP', 'ETH-GBP', 'ETH-BTC',
]
const prices = { }

optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' },
]
let options
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  logger.sync.error(`Options error: ${e.toString()}\nOptionDefs: ${JSON.stringify(optionDefinitions)}\nCmd Line: ${process.argv}\n`)
}

const dp2 = (x) => Number.parseFloat(x).toFixed(2)
const red   = "\033[1;31m"
const green = "\033[0;32m"
const reset = "\033[0;0m"

const connect = () => {
  console.log(`${new Date()} Connecting to WebSocket for price feed.`)
  let websocketTicker = new coinbasePro.WebsocketClient(
    products,
    'wss://ws-feed.pro.coinbase.com',
    null,
    { channels: ['ticker'] }
  )
  websocketTicker.on('message', (data) => {
    if (!data.price || !data.product_id) { return }
    const price = parseFloat(data.price)
    prices[data.product_id] = price
    const priceList = `${Object.entries(prices).map(([product,price]) => `${product}:${dp2(price)}`).join('  ')}`
    const opportunity = 1 - prices['ETH-BTC'] * prices['BTC-GBP'] / prices['ETH-GBP']
    process.stdout.write(`BOT: ${priceList}  ${dp2(opportunity*100)}%  \r`)
  })
  websocketTicker.on('error', console.log)
  websocketTicker.on('close', () => {
    console.log(`${new Date()} WebSocket for prices closed unexpectedly.`)
    websocketTicker = undefined
  })
  return () => {
    if (websocketTicker) {
      try { websocketTicker.disconnect() }
      catch (e) { console.log(`${new Date()} WebSocket for prices close error ${e}`) }
    }
    websocketTicker = undefined
  }
}
let closeWebSocket = connect()
setInterval(() => {
  if (prices.at + 120000 < Date.now()) {
    console.log(`${new Date()} Watchdog for price WebSocket: no price updates for 30s. Retrying feed now.`)
    closeWebSocket()
    closeWebSocket = connect()
  }
}, 30000)
