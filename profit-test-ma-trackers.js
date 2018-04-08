const framework = require('./framework')
const {ema} = require('./exponential-moving-average')

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
])

framework.runBot(async () => {
  logger.warn(`starting tests with ${options.product}`)
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const emas = [5,10,15,20,30,40,60,90,150].map(count => { return { count:count, ema:ema(count) } })

  const startTime = Date.now() - 300*60*1000
  const beforeStartTime = startTime - 300*60*1000
  const oldCandles = await exchange.candles({startTime: new Date(beforeStartTime), count: 300, granularity: 60})
  const newCandles = await exchange.candles({startTime: new Date(startTime), count: 300, granularity: 60})
  const candles = newCandles.concat(oldCandles)

  console.log('len old: ', oldCandles.length)
  console.log('len new: ', newCandles.length)
  console.log('len total: ', candles.length)
  console.log()

  console.log('first old: ', oldCandles[0].time)
  console.log('last old: ', oldCandles[oldCandles.length-1].time)
  console.log('first new: ', newCandles[0].time)
  console.log('last new: ', newCandles[newCandles.length-1].time)
  console.log()

  console.log(candles[0].time)
  console.log(candles[newCandles.length-1].time)
  console.log(candles[newCandles.length].time)
  console.log(candles[candles.length-1].time)

}, logger)
