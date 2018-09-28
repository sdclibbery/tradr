const prices = require('./gdax-prices').prices
const tracker = require('../tracker')

exports.fetcher = (authedClient, log, catchApiError, handleError) => {
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  return async () => {
    return authedClient.getAccounts()
      .then(log('GDAX: getAccounts'))
      .then(catchApiError)
      .then(async as => {
        const at = new Date().toUTCString()
        await tracker.trackBalances(as.map(a => {
          return { $currency:a.currency, $exchange:'GDAX', $at:at, $balance:dp(a.balance, 4), $available:dp(a.available, 4) }
        }))
        return as
      })
      .then(as => as.map(a => {
        return { currency: a.currency, balance: a.balance, available: a.available }
      }, {}))
      .catch(handleError('accounts'))
  }
}
