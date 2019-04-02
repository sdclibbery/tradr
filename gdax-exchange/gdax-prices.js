const gdax = require('gdax')

const prices = {}

const connect = () => {
  console.log(`${new Date()} Connecting to WebSocket for price feed.`)
  let websocketTicker = new gdax.WebsocketClient(
    [
      'BTC-EUR', 'BTC-GBP', 'BTC-USD',
      'ETH-EUR', 'ETH-BTC',
      'LTC-EUR', 'LTC-BTC',
    ],
    'wss://ws-feed.pro.coinbase.com',
    null,
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
    console.log(`${new Date()} WebSocket for prices closed unexpectedly. Retrying in 60s...`)
    websocketTicker = undefined
    setTimeout(connect, 60000)
  })
}
connect()

exports.prices = prices
