const frame =  require('./frame').apply
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const GdaxExchange = require('../gdax-exchange');
  exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  const accounts = (await exchange.accounts()).accounts.filter(a => a.balance > 0)
  let statements = {}
  for (idx in accounts) {
    const account = accounts[idx]
    statements[account.currency] = (await exchange.accountHistory(account.id))
      .map(({created_at, balance, type, amount}) => {return {time:Date.parse(created_at), balance:parseFloat(balance), type:type, amount:parseFloat(amount)}})
  }


  const history = []
//    const profit = balance - transferred


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
    </p>
    <h3>Statement</h3>
    <table>
    <tr><th>Date</th><th>transaction</th><th>amountInGbp</th><th>totalBalanceInGbp</th><th>totalProfitInGbp</th></tr>
    ${
      history.map(t => `<tr><td>${(new Date(t.time)).toUTCString()}</td><td>${t.type} ${t.amount} ${t.currency}</td><td>${t.amountInGbp}</td><td>${t.totalBalanceInGbp}</td><td>${t.totalProfitInGbp}</td></tr>`)
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

      const history = ${JSON.stringify(history)}
      const canvas = document.getElementById('balances-eur')
      const extents = accountExtents(canvas, history)
      extents.background()
      drawBalances(canvas, extents, history, t => t.totalBalanceInGbp, colours.GBP)
      drawBalances(canvas, extents, history, t => t.totalProfitInGbp, colours.GBP)
      drawLabels(canvas, extents)
    </script>
  `))
}


//-------------------

const balanceAt = (statements, time, priceAt) => {
// For each statement, find entry just before time and get balance
// Convert each to GBP
// Sum
  return 0
}

const transferredBy = (statements, time, priceAt) => {
  return Object.entries(statements)
    .map(([k, statement]) => {
      return [k, statement
        .filter(t => t.type == 'transfer')
        .filter(t => t.time <= time)
        .map(t => t.amount)
        .reduce((a,x) => a+x, 0)]
    })
    .map(([k, total]) => total * priceAt(k, 'GBP', time))
    .reduce((a,x) => a+x, 0)
}


assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nAccount history page test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

const mockPriceAt = (base, quote, time) => base=='BTC' ? 10 : 1

assertSame(balanceAt({}, 0, mockPriceAt), 0)
assertSame(balanceAt({GBP:[]}, 0, mockPriceAt), 0)
//assertSame(balanceAt({GBP:[{time:0, type:'transfer', amount:10, balance:0}]}, 0, mockPriceAt), 10)

assertSame(transferredBy({}, 0, mockPriceAt), 0)
assertSame(transferredBy({GBP:[]}, 0, mockPriceAt), 0)
assertSame(transferredBy({GBP:[{time:0, type:'transfer', amount:10, balance:0}]}, 0, mockPriceAt), 10)
assertSame(transferredBy({GBP:[
  {time:0, type:'transfer', amount:10, balance:0},
  {time:1, type:'transfer', amount:10, balance:0},
]}, 0, mockPriceAt), 10)
assertSame(transferredBy({GBP:[
  {time:0, type:'transfer', amount:10, balance:0},
  {time:1, type:'transfer', amount:10, balance:0},
]}, 1, mockPriceAt), 20)
assertSame(transferredBy({GBP:[{time:0, type:'match', amount:10, balance:0}]}, 0, mockPriceAt), 0)
assertSame(transferredBy({BTC:[{time:0, type:'transfer', amount:10, balance:0}]}, 0, mockPriceAt), 100)
assertSame(transferredBy({
  GBP:[{time:0, type:'transfer', amount:10, balance:0}],
  BTC:[{time:0, type:'transfer', amount:10, balance:0}],
}, 0, mockPriceAt), 110)
