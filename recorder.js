const GdaxExchange = require('./gdax-exchange')
const tracker = require('./tracker')

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

const trackAccounts = async () => {
  console.log(new Date(), ' Tracking accounts')
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  const accounts = await exchange.accounts()
  await tracker.trackBalances(accounts.accounts.map(a => {
    return {
      $currency:a.currency,
      $exchange:'GDAX',
      $at:new Date().toUTCString(),
      $balance:dp(a.balance, 4),
      $available:dp(a.available, 4),
      $valueInEur:dp(a.valueInEur, 4),
      $valueInBtc:dp(a.valueInBtc, 4),
    }
  }))
  console.log(new Date(), ' Tracking accounts: Done')
}
setInterval(trackAccounts, 24*60*60*1000)
trackAccounts().then()
