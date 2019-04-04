const gdax = require('gdax')

const prices = {}

const connect = (product) => {
  console.log(`${new Date()} Connecting to WebSocket for price feed for ${product}.`)
  let websocketTicker = new gdax.WebsocketClient(
    [product],
    'wss://ws-feed.pro.coinbase.com',
    null,
    { channels: ['ticker'] }
  )
  websocketTicker.on('message', (data) => {
    if (!data.price || !data.product_id || data.product_id !== product) { return }
    const price = Number.parseFloat(data.price)
    prices[product] = price
    prices.at = Date.now()
  })
  websocketTicker.on('error', e => console.log(`${new Date()} Error ${e} forWebSocket price feed for ${product}`))
  websocketTicker.on('close', () => {
    console.log(`${new Date()} WebSocket for prices for ${product} closed unexpectedly. Retrying in 60s...`)
    websocketTicker = undefined
    setTimeout(() => connect(product), 60000)
  })
}

[
  'BTC-EUR', 'BTC-GBP', 'BTC-USD',
  'ETH-EUR', 'ETH-BTC',
  'LTC-EUR', 'LTC-BTC',
].map(connect)

exports.prices = prices
