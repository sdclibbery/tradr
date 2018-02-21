const Gdax = require('gdax');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

exports.createExchange = (options) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
  const websocket = new Gdax.WebsocketClient([options.product]);
  websocket.on('error', console.log);

  const catchApiError = ({message, status, reject_reason, ...data}) => {
    if (message !== undefined || status === 'rejected') { throw new Error(message || reject_reason) }
    return data
  }

  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const priceDp = 2
  const baseDp = 8

  const exchange = {
    buy: async (price, amountOfBaseCurrency) => {
      console.log(`GDAX: buying ${dp(amountOfBaseCurrency, 8)}${baseCurrency} at ${dp(price, 2)}`)
      return authedClient.placeOrder({
        type: 'limit',
        side: 'buy',
        price: dp(price, priceDp),
        size: dp(amountOfBaseCurrency, baseDp),
        product_id: options.product,
        post_only: true,
      })
      .then(catchApiError)
      .then(({id}) => {
        return exchange.waitForOrderFill(id)
      })
    },

    stopLoss: async (price, amountOfBaseCurrency) => {
      console.log(`GDAX: setting stoploss for ${dp(amountOfBaseCurrency, 8)}${baseCurrency} at ${dp(price, 2)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'sell',
        stop: 'loss',
        stop_price: dp(price, priceDp),
        size: dp(amountOfBaseCurrency, baseDp),
        product_id: options.product,
      })
      .then(catchApiError)
      .then(({id}) => id)
    },

    waitForPriceChange: async () => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.type === 'match') {
            websocket.removeListener('message', listener)
            resolve(data)
          }
        })
      })
    },

    waitForOrderFill: async (id) => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.type === 'done' && data.order_id === id) {
            websocket.removeListener('message', listener)
            resolve(data)
          }
        })
      })
    },

    orderstatus: async (id) => {
      return authedClient.getOrder(id)
        .then(catchApiError)
        .then(({done_reason, filled_size, price}) => ({
          filled: (done_reason === 'filled'),
          filledAmountInBaseCurrency: filled_size,
          price: price,
        }))
    },

    cancelOrder: async (id) => {
      console.log(`GDAX: cancelling stoploss`)
      return authedClient.cancelOrder(id).then(catchApiError)
    },
  }
  return exchange
}
