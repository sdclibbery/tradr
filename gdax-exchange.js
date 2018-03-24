const Gdax = require('gdax');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

exports.createExchange = (options, logger) => {
  const baseCurrency = options.product && options.product.split('-')[0]
  const quoteCurrency = options.product && options.product.split('-')[1]

  const log = id => response => {
    logger.debug(id, response)
    return response
  }

  const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
  const websocket = new Gdax.WebsocketClient([options.product]);
  websocket.on('error', log('websocket error'));

  logger.debug(options)

  const handleError = ({message, status, reject_reason, ...data}) => {
    logger.debug('GDAX API Error', message, status, reject_reason, data)
    throw new Error(message || reject_reason)
  }
  const catchApiError = (data) => {
    if (data.message !== undefined || data.status === 'rejected') {
      handleError(data)
    }
    return data
  }

  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const priceDp = 2
  const baseDp = 8

  const exchange = {

    accounts: async (id) => {
      return authedClient.getAccounts()
        .then(log('getAccounts'))
        .then(catchApiError)
        .then(as => as.reduce((res, a) => {
          res[a.currency] = {balance: a.balance, available: a.available}
          return res
        }, {}))
        .catch(handleError)
    },

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
      .catch(handleError)
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
      .catch(handleError)
    },

    waitForPriceChange: async () => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.type === 'match') {
            websocket.removeListener('message', listener)
            logger.debug('waitForPriceChange', data)
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
            logger.debug('waitForOrderFill', data)
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
        .catch(handleError)
    },

    cancelOrder: async (id) => {
      console.log(`GDAX: cancelling stoploss`)
      return authedClient.cancelOrder(id)
        .then(log('cancelOrder'))
        .then(catchApiError)
        .catch(handleError)
    },
  }
  return exchange
}
