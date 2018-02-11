const Gdax = require('gdax');
const Trade = require('./trade');

const type = process.argv[2] || 'bull'
const percent = process.argv[3] || 1

let trades = [
  Trade[type](percent),
]

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

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
