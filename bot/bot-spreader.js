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
const spreadTracker = () => {
  let _bottom, _top
  return {
    snapshot: (bids, asks) => {
      _bottom = bids[0]
      _top = asks[0]
    },
    updates: (updates) => {
    },
    bottom: () => _bottom,
    top: () => _top,
  }
}
const assert = require('assert')
{
  const s = spreadTracker()
  s.snapshot([3,2,1], [4,5,6])
  assert.deepEqual([3,4], [s.bottom(),s.top()], 'snapshot')
}

// websocket feed
let websocket
const spread = spreadTracker()
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
        spread.snapshot(
          data.bids.map(([p]) => Number.parseFloat(p)),
          data.asks.map(([p]) => Number.parseFloat(p))
        )
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
