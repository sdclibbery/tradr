const GdaxExchange = require('./gdax-exchange');

const exchange = GdaxExchange.createExchange({}, {
  debug: () => {},
  error: console.log,
})

exports.fetch = async () => {
  const result = {}
  const accounts = await exchange.accounts()
  const accountsWithValuesInEur = await decorateWithValue(accounts)
  result.accounts = accountsWithValuesInEur

  result.totalValueInEur = accountsWithValuesInEur.reduce((s, a) => s + a.valueInEur, 0)

  const btcEurPrice = await exchange.latestPriceOf('BTC-EUR')
  result.totalValueInBtc = result.totalValueInEur / btcEurPrice

  result.orders = await exchange.orders()

  return result
}

const decorateWithValue = async (accounts) => {
  return (await Promise.all(
    accounts.map(async (account) => {
      const price = await getPriceAgainstEur(account.currency)
      account.valueInEur = account.balance * price
      return account
    })
  ))
}

const getPriceAgainstEur = async (currency) => {
  if (currency == 'GBP') { return await 1.14 }
  if (currency == 'EUR') { return await 1 }
  return await exchange.latestPriceOf(`${currency}-EUR`)
}
