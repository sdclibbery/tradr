const gdax = require('gdax')
const tracker = require('../tracker')

/*
const GdaxExchange = require('../gdax-exchange')
const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
const accounts = (await exchange.accounts()).accounts
const transfers = (await Promise.all(accounts.map(async ({id, currency}) => {
  const transfers = await exchange.transfersForAccount(id)
  transfers.map(t => { t.currency = currency; return t })
  return transfers
}))).reduce((acc, ts) => acc.concat(ts), [])
console.log(JSON.stringify(transfers, null, 2))
*/
