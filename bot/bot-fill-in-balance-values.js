const framework = require('./framework')
const tracker = require('../tracker')

framework.init([
])
.then(async ({ options, logger, exchange }) => {
  logger.warn(`filling in missing account values`)
  const candleSets = {
    ['BTC-EUR']: await exchange.candlesFor('BTC-EUR', {granularity: 86400}),
    ['ETH-EUR']: await exchange.candlesFor('ETH-EUR', {granularity: 86400}),
    ['ETH-BTC']: await exchange.candlesFor('ETH-BTC', {granularity: 86400}),
    ['LTC-EUR']: await exchange.candlesFor('LTC-EUR', {granularity: 86400}),
    ['LTC-BTC']: await exchange.candlesFor('LTC-BTC', {granularity: 86400}),
  }
  const balances = await tracker.getBalances()
  for (let balance of balances) {
    const {valueInEur, valueInBtc} = getValuesForBalance(candleSets, balance)
    logger.warn(`updating balance ${balance.balance} ${balance.currency} ${balance.at} valueInEur: ${valueInEur} valueInBtc: ${valueInBtc}`)
    await tracker.setBalanceValues(balance, valueInEur, valueInBtc)
  }
})
.then(framework.close)
.catch(framework.handleError)

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

const getValuesForBalance = (candleSets, balance) => {
  const curr = balance.currency
  if (curr === 'BCH' || curr === 'ETC') { return {} }

  let valueInEur
  if (curr === 'EUR') { valueInEur = balance.balance }
  else if (curr === 'GBP') { valueInEur = balance.balance * 1.14 }
  else  { valueInEur = balance.balance * getPriceFromCandle(candleSets[balance.currency+'-EUR'], balance) }
  valueInEur = dp(valueInEur, 4)

  let valueInBtc
  if (curr === 'BTC') { valueInBtc = balance.balance }
  else if (curr === 'GBP') { valueInBtc = balance.balance * 1.14 / getPriceFromCandle(candleSets['BTC-EUR'], balance) }
  else if (curr === 'EUR') { valueInBtc = balance.balance / getPriceFromCandle(candleSets['BTC-EUR'], balance) }
  else  { valueInBtc = balance.balance * getPriceFromCandle(candleSets[balance.currency+'-BTC'], balance) }
  valueInBtc = dp(valueInBtc, 4)

  return {valueInEur, valueInBtc}
}

const getPriceFromCandle = (candles, balance) => {
  if (!candles) {
    throw ('no candle set found for balance '+JSON.stringify(balance))
  }
  const candle = findCandle(candles, Date.parse(balance.at))
  if (!candle) {
    throw ('no candle found for balance '+JSON.stringify(balance))
  }
  return (candle.open + candle.close) / 2
}

const findCandle = (candles, date) => {
  return candles.filter(c => {
    const cd = Date.parse(c.time)
    return cd < date && cd+86400000 > date
  })[0]
}

//-----

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nbalance bot test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

assertSame(
  getValuesForBalance({['BTC-EUR']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:2, close:2,
  }]}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'BTC',
    balance:1,
  }),
  {valueInEur:'2.0000', valueInBtc:'1.0000'}
)

assertSame(
  getValuesForBalance({}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'BCH',
    balance:1,
  }),
  {}
)

assertSame(
  getValuesForBalance({}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'ETC',
    balance:1,
  }),
  {}
)

assertSame(
  getValuesForBalance({['BTC-EUR']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:2, close:2,
  }]}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'GBP',
    balance:1,
  }),
  {valueInEur:'1.1400', valueInBtc:'0.5700'}
)

assertSame(
  getValuesForBalance({['ETH-EUR']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:2, close:2,
  }], ['ETH-BTC']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:0.1, close:0.1,
  }]}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'ETH',
    balance:1,
  }),
  {valueInEur:'2.0000', valueInBtc:'0.1000'}
)

assertSame(
  getValuesForBalance({['LTC-EUR']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:2, close:2,
  }], ['LTC-BTC']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:0.1, close:0.1,
  }]}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'LTC',
    balance:1,
  }),
  {valueInEur:'2.0000', valueInBtc:'0.1000'}
)

assertSame(
  getValuesForBalance({['BTC-EUR']:[{
    time:'Sat, 05 May 2018 00:00:00 GMT',
    open:2, close:2,
  }]}, {
    at:'Sat, 05 May 2018 19:58:55 GMT',
    currency:'EUR',
    balance:1,
  }),
  {valueInEur:'1.0000', valueInBtc:'0.5000'}
)
