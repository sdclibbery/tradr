const Gdax = require('gdax');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

exports.createExchange = (options, logger) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const log = id => response => {
    logger.info(id, response)
    return response
  }

  const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
  const websocket = new Gdax.WebsocketClient([options.product]);
  websocket.on('error', log('websocket error'));

  logger.info(options)

  const catchApiError = ({message, status, reject_reason, ...data}) => {
    if (message !== undefined || status === 'rejected') {
      logger.info('catchApiError', message, reject_reason, status, data)
      throw new Error(message || reject_reason)
    }
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
      .then(log('buy'))
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
      .then(log('stopLoss'))
      .then(catchApiError)
      .then(({id}) => id)
    },

    waitForPriceChange: async () => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.type === 'match') {
            websocket.removeListener('message', listener)
            logger.info('waitForPriceChange', data)
            resolve({ price: data.price })
          }
        })
      })
    },

    waitForOrderFill: async (id) => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.type === 'done' && data.order_id === id) {
            websocket.removeListener('message', listener)
            logger.info('waitForOrderFill', data)
            resolve({ })
          }
        })
      })
    },

    orderStatus: async (id) => {
      return authedClient.getOrder(id)
        .then(log('orderStatus'))
        .then(catchApiError)
        .then(({done_reason, executed_value}) => ({
          filled: (done_reason === 'filled'),
          filledAmountInQuoteCurrency: executed_value,
        }))
    },

    cancelOrder: async (id) => {
      console.log(`GDAX: cancelling stoploss`)
      return authedClient.cancelOrder(id)
        .then(log('cancelOrder'))
        .then(catchApiError)
    },
  }
  return exchange
}
