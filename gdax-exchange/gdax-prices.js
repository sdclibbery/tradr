const gdax = require('gdax')
const tracker = require('../tracker')
const credentials = require('../gdax-account-credentials')

const products = [
  'BTC-EUR', 'BTC-GBP', 'BTC-USD',
  'ETH-EUR', 'ETH-GBP', 'ETH-BTC',
  'LTC-EUR', 'LTC-GBP', 'LTC-BTC',
]
const prices = {}

const connect = () => {
  console.log(`${new Date()} Connecting to WebSocket for price feed.`)
  let websocketTicker = new gdax.WebsocketClient(
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

const batch = () => {
  console.log(`${new Date()} Tracking prices`)
  products.forEach(product => {
    const price = prices[product]
    if (!!price) {
      console.log(`${new Date()} Tracking price of ${product}: ${price}`)
      tracker.trackPrice({
        $at: (new Date(prices.at)).toUTCString(),
        $product: product,
        $price: price,
      }).catch(console.log)
    }
  })
}
setInterval(batch, 24*60*60*1000)

exports.prices = prices
