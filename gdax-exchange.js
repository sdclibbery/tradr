const Gdax = require('gdax');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

exports.createExchange = (options) => {
  //const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
  const websocket = new Gdax.WebsocketClient([options.product]);
  websocket.on('error', console.log);
  return {
    buyNow: async (entryAmountInQuoteCurrency) => {entryAmountInQuoteCurrency
      return Promise.resolve({
        price: 100,
        amountOfBaseCurrencyBought: 0.1,
      })
    },
    sell: async (price, amountOfBaseCurrency) => {
      return Promise.resolve({ id: 12345 })
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
      return new Promise(() => {})
    },
    cancelOrder: async (id) => {
      return Promise.resolve({ cancelled: true })
    },
  }
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
