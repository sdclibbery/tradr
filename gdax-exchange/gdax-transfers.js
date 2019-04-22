const tracker = require('../tracker')
const GdaxExchange = require('../gdax-exchange')

const batch = () => {
  console.log(`${new Date()} Updating transfers`)
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  exchange.accounts().then(({accounts}) => {
    accounts
      .filter(({balance}) => balance != 0)
      .forEach(({id, currency}) => {
        exchange.transfersForAccount(id).then((transfers) => {
          transfers
            .filter(({completed_at}) => completed_at != undefined)
            .forEach(({type, completed_at, amount, id}) => {
              console.log(`${new Date()} ${type} of ${amount} ${currency} at ${completed_at}`)
              tracker.trackTransfer({
                $exchange: 'GDAX',
                $id: id,
                $currency: currency,
                $type: type,
                $at: completed_at,
                $amount: amount,
              }).catch(console.log)
            })
        })
      })
  })
}
setInterval(batch, 24*60*60*1000)