const Gdax = require('gdax');

const websocket = new Gdax.WebsocketClient(['BTC-EUR']);

let trade = undefined

websocket.on('message', data => {
  const {type, side, reason, price, time} = data
  if (type === 'match') {
    console.log(`match: ${price} ${side}`)
    const new_stop_loss = price*1.01
    if (!trade) {
      trade = {
        sell_in: price,
        sell_in_time: time,
        stop_loss: new_stop_loss
      }
      console.log(`* starting trade; stop loss: ${trade.stop_loss}`)
    } else {
      if (new_stop_loss < trade.stop_loss) {
        console.log(`* moving stop loss to: ${trade.stop_loss}`)
        trade.stop_loss = new_stop_loss
      }
      if (price >= trade.stop_loss) {
        trade.buy_out = price
        trade.buy_out_time = time
        const profit = trade.sell_in - trade.buy_out
        console.log(`* trade complete: profit ${profit} ${100*profit/trade.sell_in}%`)
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
