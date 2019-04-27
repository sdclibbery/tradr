const frame =  require('./frame').apply
const tracker = require('../tracker');
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  const accounts = (await exchange.accounts()).accounts
    .filter(a => a.currency == 'EUR')//!
  const transactions = (await exchange.accountHistory(accounts[0].id))
    .map(({created_at, balance, type, amount}) => {return {time:Date.parse(created_at), balance:balance, type:type, amount:amount}})

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
    <script src="/account-extents.js"></script>
    <script src="/draw-labels.js"></script>
    <script src="/draw-transactions.js"></script>
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

      const transactions = ${JSON.stringify(transactions)}
      const canvas = document.getElementById('balances-eur')
      const extents = accountExtents(canvas, transactions)
      extents.background()
      drawTransactions(canvas, extents, transactions, colours.EUR)
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
