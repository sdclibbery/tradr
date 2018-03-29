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
    logger.error('GDAX API Error', message, status, reject_reason, data)
    throw new Error(message || reject_reason)
  }
  const catchApiError = (data) => {
    if (data.message !== undefined || data.status === 'rejected') {
      handleError(data)
    }
    return data
  }

  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const quoteDp = 2
  const baseDp = 4
  const formatBase = (x) => `${dp(x, baseDp)} ${baseCurrency}`
  const formatQuote = (x) => `${dp(x, quoteDp)} ${quoteCurrency}`

  const exchange = {

    formatBase: formatBase,
    formatQuote: formatQuote,

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

    orders: async (id) => {
      return authedClient.getOrders()
        .then(log('getOrders'))
        .then(catchApiError)
        .then(os => os.map(o => {
          return {id: o.id, product: o.product_id, price:o.price, stopPrice:o.stop_price, amount:o.size, side: o.side, type: o.type, stop: o.stop, created: o.created_at}
        }))
        .catch(handleError)
    },

    order: async (side, amountOfBaseCurrency, price) => {
      logger.debug(`GDAX: ${side}ing ${formatBase(amountOfBaseCurrency)} at ${formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'limit',
        side: side,
        price: price,
        size: dp(amountOfBaseCurrency, baseDp),
        product_id: options.product,
      })
      .then(log('placeOrder'))
      .then(catchApiError)
      .then(({id}) => {
        return exchange.waitForOrderFill(id)
      })
      .catch(handleError)
    },

    buy: async (amountOfBaseCurrency, price) => {
      return exchange.order('buy', amountOfBaseCurrency, price)
    },

    sell: async (amountOfBaseCurrency, price) => {
      return exchange.order('sell', amountOfBaseCurrency, price)
    },

    orderNow: async (side, amountOfBaseCurrency, amountOfQuoteCurrency) => {
      const baseInfo = amountOfBaseCurrency ? `${formatBase(amountOfBaseCurrency)}` : ''
      const quoteInfo = amountOfQuoteCurrency ? `${formatQuote(amountOfQuoteCurrency)}` : ''
      logger.debug(`GDAX: ${side}ing ${baseInfo}${quoteInfo} at market price`)
      return authedClient.placeOrder({
        type: 'market',
        side: side,
        size: amountOfBaseCurrency && dp(amountOfBaseCurrency, baseDp),
        funds: amountOfQuoteCurrency && dp(amountOfQuoteCurrency, quoteDp),
        product_id: options.product,
      })
      .then(log('placeOrder'))
      .then(catchApiError)
      .then(({price, size, id}) => { return {id:id, price:price, size:size}})
      .catch(handleError)
    },

    buyNow: async (amountOfBase, amountOfQuote) => {
      return exchange.orderNow('buy', amountOfBase, amountOfQuote)
    },

    sellNow: async (amountOfBase, amountOfQuote) => {
      return exchange.orderNow('sell', amountOfBase, amountOfQuote)
    },

    stopLoss: async (price, amountOfBaseCurrency) => {
      logger.debug(`GDAX: setting stoploss for ${formatBase(amountOfBaseCurrency)} at ${formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'sell',
        stop: 'loss',
        stop_price: dp(price, quoteDp),
        size: dp(amountOfBaseCurrency, baseDp),
        product_id: options.product,
      })
      .then(log('stopLoss'))
      .then(catchApiError)
      .then(({id}) => id)
      .catch(handleError)
    },

    stopEntry: async (price, amountOfBaseCurrency) => {
      logger.debug(`GDAX: setting stopentry for ${formatBase(amountOfBaseCurrency)} at ${formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'buy',
        stop: 'entry',
        stop_price: dp(price, quoteDp),
        size: dp(amountOfBaseCurrency, baseDp),
        product_id: options.product,
      })
      .then(log('stopEntry'))
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
            resolve({ price: Number.parseFloat(data.price) })
          }
        })
      })
    },

    waitForOrderFill: async (id) => {
      logger.debug(`GDAX: waitForOrderFill ${id}`)
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.order_id === id) {
            logger.debug(`GDAX: waitForOrderFill: `, data)
            if (data.type === 'done') {
              websocket.removeListener('message', listener)
              logger.debug('waitForOrderFill - DONE: ', data)
              resolve({price:data.price, size:data.size})
            }
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
      logger.debug(`GDAX: cancelling order ${id}`)
      return authedClient.cancelOrder(id)
        .then(log('cancelOrder'))
        .then(catchApiError)
        .catch(handleError)
    },
  }
  return exchange
}
