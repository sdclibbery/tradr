const Gdax = require('gdax');
const Trade = require('./trade');
const Credentials = require('./gdax-account-credentials'); // NOTE the bot ONLY requires 'trading' permissions from GDAX API key

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR' },
  { name: 'amount', alias: 'a', type: Number },
  { name: 'type', alias: 't', type: String, defaultValue: 'bull' },
  { name: 'stoploss', alias: 's', type: Number, defaultValue: 1 },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
if (options.help || !options.amount) {
console.log(
`GDAX bot. Usage:
 --help: -h: Show this help
 --product: -p: GDAX product; defaults to BTC-EUR
 --amount: -a: amount to trade with; *must* be specified
 --type: -t: Set the bot type: 'bear' for a bear market, or 'bull'; defaults to bull
 --stoploss: -s: percentage offset for stoploss exit order; defaults to 1
`)
  process.exit()
}

//const authedClient = new Gdax.AuthenticatedClient(Credentials.key, Credentials.secret, Credentials.passphrase, 'https://api.gdax.com');
const websocket = new Gdax.WebsocketClient([options.product]);

const exchange = {
  buy: (price, size, cb) => {},
  sell: (price, size, cb) => {},
  cancel: (id, cb) => {},
}

let trade = Trade.trade(options, exchange)

websocket.on('message', data => {
  const {type, side, price, time} = data
  if (type === 'match') {
//    console.log(`match: ${price} ${side}`)
    const msg = trade(price, time)
    if (msg) { console.log(msg) }
    if (trade.done()) {
      console.log('Trade complete; exiting')
      process.exit()
    }
  }
});

websocket.on('error', err => {
  console.log('error: ', err)
});

websocket.on('close', () => {
  console.log('close')
});

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
x Command line args for type, percent, productId etc
x Refactor out a proper state machine
x Simulate amount
x Abstract out actual operations that a bot will perform: moving the stoploss, and the initial buy in
x Pass buy/sell/cancel closures to trade
x Trade makes initial transaction
o Support for simulation-only mode (with cmd line arg)
o Trade places stoploss order
o Trade cancels stoploss order when moving it
o Implement exchange adaptor in index.js
 o Cancel operations if an authenticated request fails
  o Note, failures may not come through as errors! Eg { message: 'Insufficient funds' } came through .then
   o Guess errors are only for actual comms errors etc; should retry these..??
o Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
 o Could even do this graduated; so exit 25% at 1% profit etc
 o This would probably be uselful for bots on automatic triggers...
*/
