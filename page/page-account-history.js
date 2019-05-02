const frame =  require('./frame').apply
const tracker = require('../tracker');
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  const accounts = (await exchange.accounts()).accounts.filter(a => a.balance > 0)
  let statement = []
  for (idx in accounts) {
    const account = accounts[idx]
    const transactions = (await exchange.accountHistory(account.id))
      .map(({created_at, balance, type, amount}) => {return {time:Date.parse(created_at), balance:balance, type:type, amount:amount, currency:account.currency}})
    statement = statement.concat(transactions)
  }
  statement.sort((l,r) => r.time - l.time)

  res.send(frame(`
    <h1>Account History</h1>
    <h3>In Eur</h3>
    <canvas id="balances-eur" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <p>
      <span id="TOTAL">Total</span>
      <span id="EUR">EUR</span>
      <span id="GBP">GBP</span>
      <span id="BTC">BTC</span>
      <span id="ETH">ETH</span>
      <span id="LTC">LTC</span>
      <span id="BCH">BCH</span>
      <span id="ETC">ETC</span>
      <span id="ZRX">ZRX</span>
    </p>
    <h3>Statement</h3>
    <table>
    <tr><th>Date</th><th>transaction</th><th>balance</th></tr>
    ${
      statement.map(t => `<tr><td>${(new Date(t.time)).toUTCString()}</td><td>${t.type} ${t.amount} ${t.currency}</td><td>${t.balance}</td></tr>`)
    }
    </table>
    <script src="/account-extents.js"></script>
    <script src="/draw-labels.js"></script>
    <script src="/draw-balances.js"></script>
    <script>
      const colours = {
        TOTAL: '#000000',
        EUR: '#707070',
        GBP: '#a0a0a0',
        BTC: '#c00000',
        ETH: '#00c000',
        LTC: '#0000c0',
      }
      Object.entries(colours).map(([k,v]) => document.getElementById(k).style='color:'+v)

      const statement = ${JSON.stringify(statement)}
      const canvas = document.getElementById('balances-eur')
      const extents = accountExtents(canvas, statement)
      extents.background()
      drawBalances(canvas, extents, statement, colours.EUR)
      drawLabels(canvas, extents)
    </script>
  `))
}


//-------------------

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nAccount history page test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}
