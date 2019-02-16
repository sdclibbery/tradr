const gdax = require('gdax')
const commandLineArgs = require('command-line-args')
const loggerFactory = require('../logger')

const logger = loggerFactory.createLogger(`${process.argv[1]}.log`)
optionDefinitions = [
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' },
]
let options
try {
  options = commandLineArgs(optionDefinitions)
} catch (e) {
  logger.sync.error(`Options error: ${e.toString()}\nOptionDefs: ${JSON.stringify(optionDefinitions)}\nCmd Line: ${process.argv}\n`)
}
const baseCurrency = options.product.split('-')[0]
const quoteCurrency = options.product.split('-')[1]

// spread tracking
const spreadTracker = (bids, asks) => {
  let _bottom = bids[0]
  let _top = asks[0]
  return {
    updates: (updates) => {
      let updatedSpread = false
      const newBottom = (b) => { _bottom=b; updatedSpread=true; }
      const newTop = (t) => { _top=t; updatedSpread=true; }
      updates.forEach(({side, price, empty}) => {
        if (side === 'buy' && price > _bottom) {
          newBottom(price)
        }
        if (side === 'sell' && price < _top) {
          newTop(price)
        }
      })
      return updatedSpread
    },
    bottom: () => _bottom,
    top: () => _top,
  }
}
const assert = require('assert')
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'snapshot')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'buy', price:2, empty:false}]), 'update with no change to spread bottom returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update with no change to spread bottom leaves spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'sell', price:5, empty:false}]), 'update with no change to spread top returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update with no change to spread top leaves spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'buy', price:3.5, empty:false}]), 'update that pushes spread bottom returns true')
  assert.deepEqual([3.5,4], [s.bottom(),s.top()], 'update that pushes spread bottom updates spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'sell', price:3.5, empty:false}]), 'update that pushes spread top returns true')
  assert.deepEqual([3,3.5], [s.bottom(),s.top()], 'update that pushes spread top updates spread')
}
// All empty:true cases

// websocket feed
let websocket
let spread
const connect = () => {
  logger.info(`BOT: Connecting to WebSocket for level2 feed.`)
  websocket = new gdax.WebsocketClient(
    [ options.product ],
    'wss://ws-feed.pro.coinbase.com',
    null,
    { channels: ['level2'] }
  )
  websocket.on('message', (data) => {
    switch (data.type) {
      case 'snapshot':
        spread = spreadTracker(
          data.bids.map(([p]) => Number.parseFloat(p)),
          data.asks.map(([p]) => Number.parseFloat(p))
        )
        logger.info(`BOT: Initial spread: ${spread.bottom()} - ${spread.top()}`)
        break;
      case 'l2update':
        spread.updates(data.changes.map(([side, priceStr, size]) => { return { side:side, price:Number.parseFloat(priceStr), empty:!size }}))
        break;
    }
  })
  websocket.on('error', logger.error)
  websocket.on('close', () => {
    logger.info(`BOT: WebSocket for level2 closed unexpectedly. Retrying in 60s...`)
    websocket = undefined
    setTimeout(connect, 60000)
  })
}
connect()
