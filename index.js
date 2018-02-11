const Gdax = require('gdax');
const Trade = require('./trade');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

const type = process.argv[2] || 'bull'
const percent = process.argv[3] || 1

/*
ToDo
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
o Verify we can place a market order; should be like this:
 const order = {
  side: 'buy',
  funds: '20.00',
  product_id: 'ETH-USD',
  type: 'market',
 };
o Pass buy/sell/cancel closures to trade
o Trade makes initial transaction
o Trade cancels operations if an authenticated request fails
 o Note, failures may not come through as errors! Eg { message: 'Insufficient funds' } came through .then
  o Guess errors are only for actual comms errors etc; should retry these..??
 o Successfull (limit) buy looks like:
o Trade does not execute further orders until the last has succcessfully cleared
o Trade cancels last stoploss and places new one when required
o Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss
 o Could even do this graduated; so exit 25% at 1% profit etc
 o This would probably be uselful for bots on automatic triggers...
*/

const productId = 'BTC-EUR';
let trades = [
  Trade[type](percent),
]

const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
authedClient.cancelOrder('invalid-order-id')
.then(data => {
  console.log('bought', data)
})
.catch(console.log);

const websocket = new Gdax.WebsocketClient([productId]);

websocket.on('message', data => {
  const {type, side, price, time} = data
  if (type === 'match') {
//    console.log(`match: ${price} ${side}`)
    trades.map((trade) => {
      const msg = trade(price, time)
      if (msg) { console.log(msg) }
    })
  }
});

websocket.on('error', err => {
  console.log('error: ', err)
});

websocket.on('close', () => {
  console.log('close')
});
