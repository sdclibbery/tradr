const coinbasePro = require('coinbase-pro')
const prices = require('./coinbasepro-exchange/coinbasepro-prices').prices
const accounts = require('./coinbasepro-exchange/coinbasepro-accounts').fetcher
const candles = require('./coinbasepro-exchange/coinbasepro-candles').fetcher
const tracker = require('./tracker')
const credentials = require('./coinbasepro-account-credentials') // NOTE the bot only requires 'trading' permissions from CoinbasePro API key and should not be given more

const client = new coinbasePro.PublicClient()
let products
client.getProducts()
  .then(ps => {
    products = ps.map(p => {
      p.quoteStep = p.quote_increment
      p.baseStep = p.base_min_size
      p.quoteDp = Math.floor(-Math.log10(p.quoteStep))
      p.baseDp = Math.floor(-Math.log10(p.baseStep))
      return p
    })
  }).catch(console.error)
exports.ready = async (product) => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const needsPrice = () => !!product
  const hasPrice = () => !!(prices[product])
  while (!products || (needsPrice() && !hasPrice())) {
    await sleep(100)
  }
}

exports.createExchange = (options, logger, websocketToUse) => {
  const baseCurrency = options.product && options.product.split('-')[0]
  const quoteCurrency = options.product && options.product.split('-')[1]

  const log = id => response => {
    logger.debug(id, JSON.stringify(response, null, 2))
    return response
  }

  const authedClient = new coinbasePro.AuthenticatedClient(credentials.key, credentials.secret, credentials.passphrase, 'https://api.pro.coinbase.com')
  const websocket = websocketToUse ? websocketToUse : (new coinbasePro.WebsocketClient([options.product]))
  websocket.on('error', log('websocket error'))

  logger.debug(options)

  const handleError = (context) => {
    return ({message, status, reject_reason, ...data}) => {
      logger.error('CoinbasePro API Error', context, JSON.stringify(message, null, 2), JSON.stringify(status, null, 2), JSON.stringify(reject_reason, null, 2), JSON.stringify(data, null, 2))
      throw new Error(message || reject_reason)
    }
  }
  const catchApiError = (data) => {
    if (data.message !== undefined || data.status === 'rejected') {
      handleError('')(data)
    }
    return data
  }
  const trackOrder = (creator, reason) => { return async (data) => {
    try {
      await tracker.trackOrder({
        $id: data.id,
        $exchange: 'CoinbasePro',
        $product: data.product_id,
        $status: 'open',
        $created: data.created_at,
        $side: data.side,
        $orderPrice: data.price,
        $priceAtCreation: exchange.latestPriceOf(data.product_id),
        $amount: data.size,
        $creator: creator || 'unknown',
        $reason: reason || 'unknown',
      })
      return data
    } catch (e) {
      console.log('trackOrder error: ', e)
      throw e
    }
  }}

  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

  const exchange = {
    quoteStep: 0.01,
    baseStep: 0.0001,
    formatBase: (x) => `${dp(x, exchange.baseDp)} ${baseCurrency}`,
    formatQuote: (x) => `${dp(x, exchange.quoteDp)} ${quoteCurrency}`,
    quoteDp: 2,
    baseDp: 3,
    roundBase: x => Number.parseFloat(dp(x, exchange.baseDp)),
    roundQuote: x => Number.parseFloat(dp(x, exchange.quoteDp)),

    accounts: accounts(authedClient, log, catchApiError, handleError),

    accountHistory: async (accountId) => {
      let data = {}
      let transactions = []
      do {
        data = await exchange.accountHistoryPage(accountId, data.before || 1)
                .then(log('CoinbasePro: getAccountHistory page'))
                .then(catchApiError)
                .catch(handleError('accountHistory'))
        transactions = data.concat(transactions)
        before = data.before
      } while (data.length > 0)
      return transactions
    },

    accountHistoryPage: (accountId, before) => {
      return new Promise((resolve, reject) => {
        authedClient.getAccountHistory(accountId, {before:before}, (err, response, data) => {
          if (err) { reject(err) }
          else {
            data.before = response.headers['cb-before']
            data.next = response.headers['cb-after']
            resolve(data)
          }
        })
      })
    },

    transfersForAccount: async (accountId) => {
      return authedClient.getAccountTransfers(accountId)
        .then(log('CoinbasePro: getAccountTransfers'))
        .then(catchApiError)
        .catch(handleError('transfersForAccount'))
    },

    orders: async () => {
      return authedClient.getOrders()
        .then(log('CoinbasePro: getOrders'))
        .then(catchApiError)
        .then(async os => {
          tracker.updateLiveOrders(os.map(o => o.id), exchange.orderStatus)
          return os
        })
        .then(os => os.map(o => {
          return {id: o.id, product: o.product_id, price:o.price, stopPrice:o.stop_price, amount:o.size, side: o.side, type: o.type, stop: o.stop, created: o.created_at}
        }))
        .catch(handleError('orders'))
    },

    order: async (side, amountOfBaseCurrency, price, product, creator, reason) => {
      await exports.ready()
      logger.debug(`CoinbasePro: ${side}ing ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'limit',
        side: side,
        price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: product || options.product,
      })
      .then(log(`CoinbasePro: order: ${side}, ${amountOfBaseCurrency}, ${price}`))
      .then(catchApiError)
      .then(trackOrder(creator, reason))
      .catch(handleError(`order: ${side}, ${amountOfBaseCurrency}, ${price}`))
    },

    buy: async (amountOfBaseCurrency, price, creator, reason) => {
      return exchange.order('buy', amountOfBaseCurrency, price, options.product, creator, reason)
    },

    sell: async (amountOfBaseCurrency, price, creator, reason) => {
      return exchange.order('sell', amountOfBaseCurrency, price, options.product, creator, reason)
    },

    orderNow: async (side, amountOfBaseCurrency, amountOfQuoteCurrency, creator, reason) => {
      await exports.ready()
      const baseInfo = amountOfBaseCurrency ? `${exchange.formatBase(amountOfBaseCurrency)}` : ''
      const quoteInfo = amountOfQuoteCurrency ? `${exchange.formatQuote(amountOfQuoteCurrency)}` : ''
      logger.debug(`CoinbasePro: ${side}ing ${baseInfo}${quoteInfo} at market price`)
      return authedClient.placeOrder({
        type: 'market',
        side: side,
        size: amountOfBaseCurrency && dp(amountOfBaseCurrency, exchange.baseDp),
        funds: amountOfQuoteCurrency && dp(amountOfQuoteCurrency, exchange.quoteDp),
        product_id: options.product,
      })
      .then(log(`CoinbasePro: orderNow: placeOrder(${side}, ${amountOfBaseCurrency}, ${amountOfQuoteCurrency})`))
      .then(catchApiError)
      .then(trackOrder(creator, reason))
      .then(({price, size, id}) => { return {id:id, price:price, size:size}})
      .catch(handleError(`order: ${side}ing ${baseInfo}${quoteInfo} at market price`))
    },

    buyNow: async (amountOfBase, amountOfQuote, creator, reason) => {
      return exchange.orderNow('buy', amountOfBase, amountOfQuote, creator, reason)
    },

    sellNow: async (amountOfBase, amountOfQuote, creator, reason) => {
      return exchange.orderNow('sell', amountOfBase, amountOfQuote, creator, reason)
    },

    stopLoss: async (price, amountOfBaseCurrency, creator, reason) => {
      await exports.ready()
      logger.debug(`CoinbasePro: setting stoploss for ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'sell',
        stop: 'loss',
        stop_price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: options.product,
      })
      .then(log(`CoinbasePro: stopLoss(${price}, ${amountOfBaseCurrency})`))
      .then(catchApiError)
      .then(({id}) => id)
      .catch(handleError(`stopLoss(${price}, ${amountOfBaseCurrency})`))
    },

    stopEntry: async (price, amountOfBaseCurrency, creator, reason) => {
      await exports.ready()
      logger.debug(`CoinbasePro: setting stopentry for ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'buy',
        stop: 'entry',
        stop_price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: options.product,
      })
      .then(log(`CoinbasePro: stopEntry(${price}, ${amountOfBaseCurrency})`))
      .then(catchApiError)
      .then(({id}) => id)
      .catch(handleError(`stopEntry(${price}, ${amountOfBaseCurrency})`))
    },

    allPrices: () => {
      return prices
    },

    latestPrice: () => {
      return exchange.latestPriceOf(options.product)
    },

    latestPriceOf: (product) => {
      const price = prices[product]
      if (!price) {
        const msg = `no price found for product ${product}`
        logger.error(msg)
        throw new Error(msg)
      }
      return price
    },

    _lastPrice: null,
    waitForPriceChange: async () => {
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          const price = Number.parseFloat(data.price)
          if (data.type === 'match' && exchange._lastPrice != price) {
            websocket.removeListener('message', listener)
            logger.debug('waitForPriceChange', data)
            exchange._lastPrice = price
            resolve({ price: price, time: data.time })
          }
        })
      })
    },

    waitForOrderFill: async (id) => {
      logger.debug(`CoinbasePro: waitForOrderFill ${id}`)
      return new Promise((resolve, reject) => {
        websocket.on('message', function listener (data) {
          if (data.order_id === id) {
            logger.debug(`CoinbasePro: waitForOrderFill: `, data)
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
        .then(log('CoinbasePro: orderStatus'))
        .then(catchApiError)
        .then(({done_reason, executed_value, price}) => ({
          filled: (done_reason === 'filled'),
          filledAmountInQuoteCurrency: executed_value,
          price: price,
        }))
        .catch(handleError(`orderStatus: ${id}`))
    },

    cancelOrder: async (id) => {
      logger.debug(`CoinbasePro: cancelling order ${id}`)
      return authedClient.cancelOrder(id)
        .then(log(`CoinbasePro: cancelOrder(${id})`))
        .then(catchApiError)
        .then(async () => await tracker.trackOrderCancellation(id))
        .then(() => {cancelled:true})
        .catch(handleError(`cancelOrder(${id})`))
    },

    candles: candles(options.product, authedClient, log, catchApiError, handleError),
    candlesFor: (product, settings) => {
      return candles(product, authedClient, log, catchApiError, handleError)(settings)
    },
  }

  if (options.product) {
    const product = products.filter(p => p.id == options.product)[0]
    exchange.quoteStep = product.quoteStep
    exchange.baseStep = product.baseStep
    exchange.quoteDp = product.quoteDp
    exchange.baseDp = product.baseDp
  }
  return exchange
}
