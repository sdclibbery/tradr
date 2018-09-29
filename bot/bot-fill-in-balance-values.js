const framework = require('./framework')
const tracker = require('../tracker')

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

framework.init([
])
.then(async ({ options, logger, exchange }) => {
  logger.warn(`filling in missing account values...`)

  const candles = await exchange.candlesFor('BTC-EUR', {granularity: 86400})
  const balances = await tracker.getBalances()
  const toUpdate = balances
    .filter(b => b.valueInEur === null)
    .filter(b => b.currency === 'BTC')
  for (let balance of toUpdate) {
      const candle = findCandle(candles, Date.parse(balance.at))
      if (!candle) {
        logger.error(`no candle found for balance ${JSON.stringify(balance)}`)
        continue
      }
      const price = (candle.open + candle.close) / 2
      const valueInEur = dp(balance.balance * price, 4)
      logger.warn(`updating balance ${balance.balance} ${balance.currency} ${balance.at} valueInEur: ${valueInEur}`)
      await tracker.updateBalanceValueInEur(balance, valueInEur)
    }
})
.then(framework.close)
.catch(framework.handleError)

const findCandle = (candles, date) => {
  return candles.filter(c => {
    const cd = Date.parse(c.time)
    return cd < date && cd+86400000 > date
  })[0]
}
