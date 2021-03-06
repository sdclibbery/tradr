const coinbasePro = require('coinbase-pro')
const tracker = require('../tracker')
const credentials = require('../coinbasepro-account-credentials')

const products = [
  'BTC-EUR', 'BTC-GBP', 'BTC-USD',
  'ETH-EUR', 'ETH-GBP', 'ETH-BTC',
  'LTC-EUR', 'LTC-GBP', 'LTC-BTC',
]
const prices = { products }
prices['EUR-GBP'] = 0.87 // Needs to be got from somewhere

const connect = () => {
  console.log(`${new Date()} Connecting to WebSocket for price feed.`)
  let websocketTicker = new coinbasePro.WebsocketClient(
    products,
    'wss://ws-feed.pro.coinbase.com',
    credentials,
    { channels: ['ticker'] }
  )
  websocketTicker.on('message', (data) => {
    if (!data.price || !data.product_id) { return }
    const price = Number.parseFloat(data.price)
    prices[data.product_id] = price
    prices.at = Date.now()
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
    console.log(`${new Date()} Watchdog for price WebSocket: no price updates for 2 min. Retrying feed now.`)
    closeWebSocket()
    closeWebSocket = connect()
  }
}, 60000)

exports.prices = prices
