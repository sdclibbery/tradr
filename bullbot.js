const Gdax = require('gdax');

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

let trade = undefined

websocket.on('message', data => {
  const {type, side, reason, price, time} = data
  if (type === 'match') {
    console.log(`match: ${price} ${side}`)
    const new_stop_loss = price*0.99
    if (!trade) {
      trade = {
        buy_in: price,
        buy_in_time: time,
        stop_loss: new_stop_loss
      }
      console.log(`* starting trade; stop loss: ${trade.stop_loss}`)
    } else {
      if (new_stop_loss > trade.stop_loss) {
        console.log(`* moving stop loss to: ${trade.stop_loss}`)
        trade.stop_loss = new_stop_loss
      }
      if (price <= trade.stop_loss) {
        trade.sell_out = price
        trade.sell_out_time = time
        const profit = trade.sell_out - trade.buy_in
        console.log(`* trade complete: profit ${profit} ${100*profit/trade.buy_in}%`)
        console.log(trade)
        process.exit()
      }
    }
  }
});

websocket.on('error', err => {
  console.log('error: ', err)
});

websocket.on('close', () => {
  console.log('close')
});
