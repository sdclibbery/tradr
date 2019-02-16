const assert = require('assert')
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
  let _bids = bids
  let _asks = asks
  return {
    updates: (updates) => {
      const oldBottom = _bids[0]
      const oldTop = _asks[0]
      updates.forEach(({side, price, clear}) => {
        if (side === 'buy') {
          let i
          for (i=0; i < _bids.length; i++) { if (_bids[i] <= price) break; } // Find indes where price fits into bids list
          if (_bids[i] === price) {
            if (clear) _bids.splice(i,1) // remove cleared price
          } else {
            _bids.splice(i, 0, price) // insert new price
          }
        }
        if (side === 'sell') {
          let i
          for (i=0; i < _asks.length; i++) { if (_asks[i] >= price) break; } // Find indes where price fits into bids list
          if (_asks[i] === price) {
            if (clear) _asks.splice(i,1) // remove cleared price
          } else {
            _asks.splice(i, 0, price) // insert new price
          }
        }
      })
      return _bids[0] !== oldBottom || _asks[0] !== oldTop
    },
    bottom: () => _bids[0],
    top: () => _asks[0],
  }
}

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
        spread.updates(data.changes.map(([side, priceStr, size]) => { return { side:side, price:Number.parseFloat(priceStr), clear:!size }}))
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

//---------------------------------------------
// --- Spread Tracker tests ---
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'snapshot')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'buy', price:2, clear:false}]), 'update with no change to spread bottom returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update with no change to spread bottom leaves spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'sell', price:5, clear:false}]), 'update with no change to spread top returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update with no change to spread top leaves spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'buy', price:3.5, clear:false}]), 'update that pushes spread bottom returns true')
  assert.deepEqual([3.5,4], [s.bottom(),s.top()], 'update that pushes spread bottom updates spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'sell', price:3.5, clear:false}]), 'update that pushes spread top returns true')
  assert.deepEqual([3,3.5], [s.bottom(),s.top()], 'update that pushes spread top updates spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'sell', price:3.5, clear:false}]), 'update that pushes spread top returns true')
  assert.deepEqual([3,3.5], [s.bottom(),s.top()], 'update that pushes spread top updates spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'buy', price:2, clear:true}]), 'update clear non-bottom returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update clear non-bottom spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'sell', price:5, clear:true}]), 'update clear non-top returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update clear non-top spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'buy', price:3, clear:true}]), 'update clear bottom returns true')
  assert.deepEqual([2,4], [s.bottom(),s.top()], 'update clear bottom updates spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(true, s.updates([{side:'sell', price:4, clear:true}]), 'update clear top returns true')
  assert.deepEqual([3,5], [s.bottom(),s.top()], 'update clear top updates spread')
}
{
  const s = spreadTracker([3], [4])
  assert.strictEqual(true, s.updates([{side:'buy', price:2, clear:false}, {side:'buy', price:3, clear:true}]), 'update buy to new price at end returns true')
  assert.deepEqual([2,4], [s.bottom(),s.top()], 'update buy to new price at end has new spread')
}
{
  const s = spreadTracker([3], [4])
  assert.strictEqual(true, s.updates([{side:'sell', price:5, clear:false}, {side:'sell', price:4, clear:true}]), 'update sell to new price at end returns true')
  assert.deepEqual([3,5], [s.bottom(),s.top()], 'update sell to new price at end has new spread')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'buy', price:2.5, clear:true}]), 'update missing clear non-bottom returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update missing clear non-bottom spread untouched')
}
{
  const s = spreadTracker([3,2,1], [4,5,6])
  assert.strictEqual(false, s.updates([{side:'sell', price:4.5, clear:true}]), 'update missing clear non-top returns false')
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'update missing clear non-top spread untouched')
}
