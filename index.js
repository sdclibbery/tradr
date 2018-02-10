const Gdax = require('gdax');
const Trade = require('./trade');

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

let trades = [
  Trade.bear(1),
  Trade.bear(1.5),
  Trade.bear(2),
  Trade.bull(1),
  Trade.bull(1.5),
  Trade.bull(2),
]

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
