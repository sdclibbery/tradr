const Gdax = require('gdax');

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

websocket.on('message', data => {
  const {type, side, reason, price, time} = data
  if (type === 'match') {
    console.log(`match: ${price} ${side}`)
  }
});

websocket.on('error', err => {
  console.log('error: ', err)
});

websocket.on('close', () => {
  console.log('close')
});
