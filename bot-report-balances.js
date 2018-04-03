const framework = require('./framework')

const { options, logger, exchange } = framework.initBot([])

framework.runBot(async () => {
  const accounts = await exchange.accounts()
  const dp4 = (x) => Number.parseFloat(x).toFixed(4)

  const accountsWithValuesInEur = await decorateWithValue(accounts)
  const accountInfo = accountsWithValuesInEur
    .map(a => {
      return `${a.currency}: balance ${dp4(a.balance)} ${a.currency}; available: ${dp4(a.available)} ${a.currency}; value: ${dp4(a.valueInEur)} EUR`
    }).join('\n')
  logger.sync.info(`BOT: Account balances:\n${accountInfo}`)

  const totalValueInEur = accountsWithValuesInEur.reduce((s, a) => s + a.valueInEur, 0)
  logger.sync.info(`BOT: Total Value:\n${dp4(totalValueInEur)} EUR`)

  const btcEurPrice = await exchange.latestPriceOf('BTC-EUR')
  const totalValueInBtc = totalValueInEur / btcEurPrice
  logger.sync.info(`BOT: Total Value:\n${dp4(totalValueInBtc)} BTC`)
}, logger)

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
