const gdax = require('gdax')

const prices = {}
const websocketTicker = new gdax.WebsocketClient(
  [
    'BTC-EUR',
    'ETH-EUR', 'ETH-BTC',
    'LTC-EUR', 'LTC-BTC',
    'ETC-EUR', 'ETC-BTC',
    'BCH-EUR', 'BCH-BTC',
    'ZRX-EUR', 'ZRX-BTC',
  ],
  'wss://ws-feed.pro.coinbase.com',
  null,
  { channels: ['ticker'] }
)
websocketTicker.on('error', console.log)
websocketTicker.on('message', (data) => {
  if (!data.price || !data.product_id) { return }
  const price = Number.parseFloat(data.price)
  prices[data.product_id] = price
})

exports.prices = prices
