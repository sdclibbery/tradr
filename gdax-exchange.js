const Gdax = require('gdax');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

exports.createExchange = (options) => {
  const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
  const websocket = new Gdax.WebsocketClient([options.product]);
  websocket.on('error', console.log);

  const catchApiError = ({message, status, reject_reason, ...data}) => {
    if (message !== undefined || status === 'rejected') { throw new Error(message || reject_reason) }
    //console.log(data)
    return data
  }

  const format = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const priceDp = 2
  const baseDp = 8

  const exchange = {
    buy: async (price, amountOfBaseCurrency) => {
      return authedClient.placeOrder({
        type: 'limit',
        side: 'buy',
        price: format(price, priceDp),
        size: format(amountOfBaseCurrency, baseDp),
        product_id: options.product,
        post_only: true,
      })
      .then(catchApiError)
      .then(({id}) => {
        return exchange.waitForOrderFill(id)
      })
    },

    stopLoss: async (price, amountOfBaseCurrency) => {
      return authedClient.placeOrder({
        type: 'limit',
        side: 'sell',
        stop: 'loss',
        price: format(price, priceDp),
        stop_price: format(price, priceDp),
        size: format(amountOfBaseCurrency, baseDp),
        product_id: options.product,
      }).then(catchApiError)
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

    cancelOrder: async (id) => {
      return authedClient.cancelOrder(id).then(catchApiError)
    },
  }
  return exchange
}


/*
x Verify we can place a limit order:
 authedClient.buy({ price: '4000.00', size: '0.001', product_id: productId })
 { id: '6f08fca6-df79-4ae0-a5fc-5a2198c6c8e3',
  price: '4000.00000000',
  size: '0.00100000',
  product_id: 'BTC-EUR',
  side: 'buy',
  stp: 'dc',
  type: 'limit',
  time_in_force: 'GTC',
  post_only: false,
  created_at: '2018-02-11T08:56:22.439806Z',
  fill_fees: '0.0000000000000000',
  filled_size: '0.00000000',
  executed_value: '0.0000000000000000',
  status: 'pending',
  settled: false }
  { message: 'Insufficient funds' }
  { message: 'Invalid API Key' }
x Verify we can cancel an order:
 authedClient.cancelOrder('6f08fca6-df79-4ae0-a5fc-5a2198c6c8e3')
 [ '6f08fca6-df79-4ae0-a5fc-5a2198c6c8e3' ]
 { message: 'order not found' }
*/
