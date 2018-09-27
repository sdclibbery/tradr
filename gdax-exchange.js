const Gdax = require('gdax')
const tracker = require('./tracker')
const Credentials = require('./gdax-account-credentials') // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

const prices = {}
const websocketTicker = new Gdax.WebsocketClient(
  ['BTC-EUR', 'ETH-EUR', 'LTC-EUR', 'ETH-BTC', 'LTC-BTC', 'ETC-EUR', 'BCH-EUR'],
  'wss://ws-feed.pro.coinbase.com',
  Credentials,
  { channels: ['ticker'] }
)
websocketTicker.on('error', console.log)
websocketTicker.on('message', (data) => {
  if (!data.price || !data.product_id) { return }
  //console.log(data.product_id, data.price)
  const price = Number.parseFloat(data.price)
  prices[data.product_id] = price
})

const client = new Gdax.PublicClient()
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
exports.ready = async () => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  while (!products) {
    await sleep(100)
  }
}

exports.createExchange = (options, logger) => {
  const baseCurrency = options.product && options.product.split('-')[0]
  const quoteCurrency = options.product && options.product.split('-')[1]

  const log = id => response => {
    logger.debug(id, response)
    return response
  }

  const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.pro.coinbase.com')
  const websocket = new Gdax.WebsocketClient([options.product])
  websocket.on('error', log('websocket error'))

  logger.debug(options)

  const handleError = (context) => {
    return ({message, status, reject_reason, ...data}) => {
      logger.error('GDAX API Error', context, message, status, reject_reason, data)
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
        $exchange: 'GDAX',
        $product: data.product_id,
        $status: 'open',
        $created: data.created_at,
        $side: data.side,
        $orderPrice: data.price,
        $priceAtCreation: await exchange.latestPriceOf(data.product_id),
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

    accounts: async () => {
      return authedClient.getAccounts()
        .then(log('GDAX: getAccounts'))
        .then(catchApiError)
        .then(async as => {
          const at = new Date().toUTCString()
          await tracker.trackBalances(as.map(a => {
            return { $currency:a.currency, $exchange:'GDAX', $at:at, $balance:dp(a.balance, 4), $available:dp(a.available, 4) }
          }))
          return as
        })
        .then(as => as.map(a => {
          return { currency: a.currency, balance: a.balance, available: a.available }
        }, {}))
        .catch(handleError('accounts'))
    },

    orders: async () => {
      return authedClient.getOrders()
        .then(log('GDAX: getOrders'))
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
      logger.debug(`GDAX: ${side}ing ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'limit',
        side: side,
        price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: product || options.product,
      })
      .then(log(`GDAX: order: ${side}, ${amountOfBaseCurrency}, ${price}`))
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
      logger.debug(`GDAX: ${side}ing ${baseInfo}${quoteInfo} at market price`)
      return authedClient.placeOrder({
        type: 'market',
        side: side,
        size: amountOfBaseCurrency && dp(amountOfBaseCurrency, exchange.baseDp),
        funds: amountOfQuoteCurrency && dp(amountOfQuoteCurrency, exchange.quoteDp),
        product_id: options.product,
      })
      .then(log(`GDAX: orderNow: placeOrder(${side}, ${amountOfBaseCurrency}, ${amountOfQuoteCurrency})`))
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
      logger.debug(`GDAX: setting stoploss for ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'sell',
        stop: 'loss',
        stop_price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: options.product,
      })
      .then(log(`GDAX: stopLoss(${price}, ${amountOfBaseCurrency})`))
      .then(catchApiError)
      .then(({id}) => id)
      .catch(handleError(`stopLoss(${price}, ${amountOfBaseCurrency})`))
    },

    stopEntry: async (price, amountOfBaseCurrency, creator, reason) => {
      await exports.ready()
      logger.debug(`GDAX: setting stopentry for ${exchange.formatBase(amountOfBaseCurrency)} at ${exchange.formatQuote(price)}`)
      return authedClient.placeOrder({
        type: 'market',
        side: 'buy',
        stop: 'entry',
        stop_price: dp(price, exchange.quoteDp),
        size: dp(amountOfBaseCurrency, exchange.baseDp),
        product_id: options.product,
      })
      .then(log(`GDAX: stopEntry(${price}, ${amountOfBaseCurrency})`))
      .then(catchApiError)
      .then(({id}) => id)
      .catch(handleError(`stopEntry(${price}, ${amountOfBaseCurrency})`))
    },

    latestPrice: () => {
      return exchange.latestPriceOf(options.product)
    },

    latestPriceOf: (product) => {
      const price = prices[product]
      if (!price) { logger.error('no price found for product', product) }
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
        .then(log('GDAX: orderStatus'))
        .then(catchApiError)
        .then(({done_reason, executed_value, price}) => ({
          filled: (done_reason === 'filled'),
          filledAmountInQuoteCurrency: executed_value,
          price: price,
        }))
        .catch(handleError(`orderStatus: ${id}`))
    },

    cancelOrder: async (id) => {
      logger.debug(`GDAX: cancelling order ${id}`)
      return authedClient.cancelOrder(id)
        .then(log(`GDAX: cancelOrder(${id})`))
        .then(catchApiError)
        .then(async () => await tracker.trackOrderCancellation(id))
        .then(() => {cancelled:true})
        .catch(handleError(`cancelOrder(${id})`))
    },

    candles: async ({startTime, count, granularity}) => {
      granularity = granularity || 60
      count = count || 300
      start = startTime || new Date(Date.now() - count*granularity*1000)
      end = new Date(start.getTime() + count*granularity*1000)
      const candleTimeToDate = epochSeconds => {
        const d = new Date()
        d.setTime(epochSeconds*1000)
        return d
      }
      const fillInCandleGaps = cs => {
        const filledIn = []
        const lastCandle = () => filledIn[filledIn.length-1]
        const round = x => x - x%granularity
        const nextCandleTime = () => (lastCandle() ? lastCandle()[0] : round(start.getTime()/1000)) + granularity
        const lastClose = (c) => lastCandle() ? lastCandle()[4] : c[3]
        const extraCandle = (c) => [nextCandleTime(), lastClose(c), lastClose(c), lastClose(c), lastClose(c), 0]
        cs.reverse().forEach(c => {
          while (c[0] > nextCandleTime()) {
            filledIn.push(extraCandle(c))
          }
          filledIn.push(c)
        })
        while (end.getTime()/1000 > nextCandleTime()) {
          filledIn.push(extraCandle())
        }
        return filledIn.reverse()
      }
      return authedClient.getProductHistoricRates(options.product, { start: start.toISOString(), end: end.toISOString(), granularity: granularity })
//        .then(log(`GDAX: getProductHistoricRates`))
        .then(catchApiError)
        .then(fillInCandleGaps)
        .then(cs => cs.map(candle => {
          return { time: candleTimeToDate(candle[0]), low: candle[1], high: candle[2], open: candle[3], close: candle[4], volume: candle[5] }
        }))
        .catch(handleError('candles ${granularity}'))
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
