const Gdax = require('gdax');
const Trade = require('./trade');

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

let trades = [
  Trade.bear(0.1),
  Trade.bear(1),
  Trade.bull(0.1),
  Trade.bull(1),
]

websocket.on('message', data => {
  const {type, side, price, time} = data
  if (type === 'match') {
    console.log(`match: ${price} ${side}`)
    trades.map((trade) => trade(price, time))
  }
});

websocket.on('error', err => {
  console.log('error: ', err)
});

websocket.on('close', () => {
  console.log('close')
});
