const prices = require('./gdax-prices').prices
const tracker = require('../tracker')

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

exports.fetcher = (authedClient, log, catchApiError, handleError) => {
  return async () => {
    return authedClient.getAccounts()
      .then(log('CoinbasePro: getAccounts'))
      .then(catchApiError)
      .then(decorate)
      .catch(handleError('accounts'))
  }
}

const decorate = (accounts) => {
  const decorated = {}
  const accountsWithValuesInGbp = decorateWithValue(accounts)
  decorated.accounts = accountsWithValuesInGbp
  decorated.totalValueInGbp = accountsWithValuesInGbp
        .filter(({valueInGbp}) => valueInGbp)
        .reduce((s, a) => s + a.valueInGbp, 0)
  decorated.btcGbpPrice = prices['BTC-GBP']
  decorated.totalValueInBtc = decorated.totalValueInGbp / decorated.btcGbpPrice
  return decorated
}

const decorateWithValue = (accounts) => {
  const btcGbpPrice = prices['BTC-GBP']
  return accounts.map((account) => {
    const price = getPriceAgainstGbp(account.currency)
    account.valueInGbp = (account.balance == 0) ? 0 : account.balance * price
    account.valueInBtc = account.valueInGbp / btcGbpPrice
    return account
  })
}

const getPriceAgainstGbp = (currency) => {
  if (currency == 'GBP') { return 1 }
  return prices[`${currency}-GBP`]
}
