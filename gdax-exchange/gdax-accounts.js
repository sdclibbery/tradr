const prices = require('./gdax-prices').prices
const tracker = require('../tracker')

const gbpToEurRate = 1.14
const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
const dp2 = (x) => dp(x, 4)
const dp4 = (x) => dp(x, 4)

exports.fetcher = (authedClient, log, catchApiError, handleError) => {
  return async () => {
    return authedClient.getAccounts()
      .then(log('GDAX: getAccounts'))
      .then(catchApiError)
      .then(decorate)
      .then(track)
      .then(data => data.accounts.map(a => {
        return { currency: a.currency, balance: a.balance, available: a.available }
      }, {}))
      .catch(handleError('accounts'))
  }
}

const decorate = (accounts) => {
  const decorated = {}
  const accountsWithValuesInEur = decorateWithValue(accounts)
  decorated.accounts = accountsWithValuesInEur
  decorated.totalValueInEur = accountsWithValuesInEur.reduce((s, a) => s + a.valueInEur, 0)
  decorated.btcEurPrice = latestPriceOf('BTC-EUR')
  decorated.totalValueInBtc = decorated.totalValueInEur / decorated.btcEurPrice
  return decorated
}

const decorateWithValue = (accounts) => {
  return accounts.map((account) => {
    const price = getPriceAgainstEur(account.currency)
    account.valueInEur = account.balance * price
    return account
  })
}

const getPriceAgainstEur = (currency) => {
  if (currency == 'GBP') { return gbpToEurRate }
  if (currency == 'EUR') { return 1 }
  return latestPriceOf(`${currency}-EUR`)
}

const latestPriceOf = (account) => {
  return prices[account]
}

const track = async (data) => {
  await tracker.trackBalances(data.accounts.map(a => {
    return {
      $currency:a.currency,
      $exchange:'GDAX',
      $at:new Date().toUTCString(),
      $balance:dp(a.balance, 4),
      $available:dp(a.available, 4)
    }
  }))
  return data
}
