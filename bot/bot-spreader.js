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

const nearTo = (a,b) => ((a >= b - 1e-8) && (a <= b + 1e-8))

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
          for (i=0; i < _bids.length; i++) { if (_bids[i] <= price) break; } // Find index where price fits into bids list
          if (nearTo(_bids[i], price)) {
            if (clear) _bids.splice(i,1) // remove cleared price
          } else {
            _bids.splice(i, 0, price) // insert new price
          }
        }
        if (side === 'sell') {
          let i
          for (i=0; i < _asks.length; i++) { if (_asks[i] >= price) break; } // Find index where price fits into bids list
          if (nearTo(_asks[i], price)) {
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
  logger.info(`BOT: Connecting to WebSocket for level2 feed on ${options.product}.`)
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
        if (spread.updates(data.changes.map(([side, priceStr, size]) => { return { side:side, price:Number.parseFloat(priceStr), clear:(size == "0") }}))) {
          logger.info(`BOT: New spread: ${spread.bottom()} - ${spread.top()}\n${JSON.stringify(data.changes)}`)
        }
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
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()], 'snapshot')
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'buy', price:2.1, clear:false}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'sell', price:5.1, clear:false}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(true, s.updates([{side:'buy', price:3.5, clear:false}]))
  assert.deepEqual([3.5,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(true, s.updates([{side:'sell', price:3.5, clear:false}]))
  assert.deepEqual([3.1,3.5], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'buy', price:2.1, clear:true}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'sell', price:5.1, clear:true}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(true, s.updates([{side:'buy', price:3.1, clear:true}]))
  assert.deepEqual([2.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(true, s.updates([{side:'sell', price:4.1, clear:true}]))
  assert.deepEqual([3.1,5.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1], [4.1])
  assert.strictEqual(true, s.updates([{side:'buy', price:2.1, clear:false}, {side:'buy', price:3.1, clear:true}]))
  assert.deepEqual([2.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1], [4.1])
  assert.strictEqual(true, s.updates([{side:'sell', price:5.1, clear:false}, {side:'sell', price:4.1, clear:true}]))
  assert.deepEqual([3.1,5.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'buy', price:2.5, clear:true}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
{
  const s = spreadTracker([3.1,2.1,1.1], [4.1,5.1,6.1])
  assert.strictEqual(false, s.updates([{side:'sell', price:4.5, clear:true}]))
  assert.deepEqual([3.1,4.1], [s.bottom(),s.top()])
}
