const frame =  require('./frame').apply
const tracker = require('../tracker');

const dp = (x, dp) => (isNaN(x)) ? '?' : Number.parseFloat(x).toFixed(dp)
exports.render = async (req, res, next) => {
  const coinbasepro = require('../coinbasepro-exchange');
  exchange = coinbasepro.createExchange({}, { debug: () => {}, error: console.log, })
  const accounts = (await exchange.accounts()).accounts.filter(a => a.balance > 0)
  let statements = {}
  for (idx in accounts) {
    const account = accounts[idx]
    statements[account.currency] = (await exchange.accountHistory(account.id))
      .map(({created_at, balance, type, amount}) => {return {time:Date.parse(created_at), balance:parseFloat(balance), type:type, amount:parseFloat(amount), currency:account.currency}})
  }

  const convertAndSum = async (results, date) => {
    const priceAt = async (base, quote, date) => {
      if (base == quote) { return Promise.resolve(1) }
      if (base == 'EUR' && quote == 'GBP') { return Promise.resolve(1/1.15) }
      return (await tracker.priceAt(`${base}-${quote}`, date)).price
    }
    let total = 0
    for (idx in results) {
      const [k,v] = results[idx]
      total += v * (await priceAt(k, 'GBP', date))
    }
    return total
  }

  const fullHistory = []
  for (d = 0; d <= 365*2; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const totalBalanceInGbp = await convertAndSum(balanceAt(statements, date), date)
    const totalTransferredInGbp = await convertAndSum(transferredBy(statements, date), date)
    fullHistory.push({
      time:date.getTime(),
      totalBalanceInGbp:totalBalanceInGbp,
      totalTransferredInGbp:totalTransferredInGbp,
      totalProfitInGbp:totalBalanceInGbp - totalTransferredInGbp,
    })
  }
  const history = fullHistory.filter(t => t.totalBalanceInGbp)

  const convertAndSumNow = (results) => {
    const pricesNow = exchange.allPrices()
    const priceNow = (base, quote) => {
      if (base == quote) { return 1 }
      if (base == 'EUR' && quote == 'GBP') { return 1/1.15 }
      return parseFloat(pricesNow[`${base}-${quote}`])
    }
    let total = 0
    for (idx in results) {
      const [k,v] = results[idx]
      total += v * priceNow(k, 'GBP')
    }
    return total
  }
  const dateNow = new Date()
  const totalBalanceNowInGbp = convertAndSumNow(balanceAt(statements, dateNow))
  const totalTransferredNowInGbp = convertAndSumNow(transferredBy(statements, dateNow))
  const totalProfitNowInGbp = totalBalanceNowInGbp - totalTransferredNowInGbp
  const totalFiatTransfersNowInGbp = convertAndSumNow(fiatTransferredBy(statements, dateNow))

  const btcPriceHistory = (await tracker.pricesOf('BTC-GBP'))
    .map(({at, price}) => {return {time:Date.parse(at), price:parseFloat(price)}})
    .sort((l,r) => l.time - r.time)

  const orders = (await tracker.getFilledOrders())
    .map(({product, created, orderPrice, priceAtCreation, closeTime}) => {return {product, created:Date.parse(created), filled:Date.parse(closeTime), orderPrice:parseFloat(orderPrice), priceAtCreation:parseFloat(priceAtCreation)}})
    .filter(({orderPrice, priceAtCreation}) => Math.abs(1 - orderPrice/priceAtCreation)>0.01)

  res.send(frame(`
    <h1>Account History</h1>
    <h3>Profit against fiat in GBP</h3>
    <canvas id="profits-gbp" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <p>Total portfolio now: ${dp(totalBalanceNowInGbp, 2)} GBP</p>
    <p>Total profit now: ${dp(totalProfitNowInGbp, 2)} GBP</p>
    <p>Total fiat transfers now: ${dp(totalFiatTransfersNowInGbp, 2)} GBP</p>
    <h3>Portfolio in GBP</h3>
    <canvas id="balances-gbp" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <p>
      <span id="TOTAL">Total</span>
      <span id="EUR">EUR</span>
      <span id="GBP">GBP</span>
      <span id="BTC">BTC</span>
      <span id="ETH">ETH</span>
      <span id="LTC">LTC</span>
    </p>
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
      const btcPriceHistory = ${JSON.stringify(btcPriceHistory)}
      const orders = ${JSON.stringify(orders)}
      {
        const canvas = document.getElementById('profits-gbp')
        const extents = accountExtents(canvas, history, t => t.totalProfitInGbp)
        const btcPriceExtents = accountExtents(canvas, btcPriceHistory, t => t.price)
        extents.background()
        drawOrders(canvas, extents, orders, colours)
        drawBalanceLine(canvas, extents, btcPriceHistory, t => t.price*extents.range/btcPriceExtents.maxPrice + extents.minPrice, colours.BTC+'40')
        drawBalanceLine(canvas, extents, history, t => t.totalProfitInGbp, colours.GBP)
        drawLabels(canvas, extents)
      }
      {
        const canvas = document.getElementById('balances-gbp')
        const extents = accountExtents(canvas, history, t => t.totalBalanceInGbp)
        extents.background()
        drawBalanceLine(canvas, extents, history, t => t.totalBalanceInGbp, colours.TOTAL)
        drawLabels(canvas, extents)
      }
    </script>
  `))
}

const balanceAt = (statements, time) => {
return Object.entries(statements)
  .map(([k, statement]) => {
    return [k, ((statement.find(t => t.time <= time) || {}).balance || 0)]
  })
}

const transferredBy = (statements, time) => {
  return Object.entries(statements)
    .map(([k, statement]) => {
      return [k, statement
        .filter(t => t.type == 'transfer')
        .filter(t => t.time <= time)
        .map(t => t.amount)
        .reduce((a,x) => a+x, 0)]
    })
}

const fiatTransferredBy = (statements, time) => {
  return Object.entries(statements)
    .map(([k, statement]) => {
      return [k, statement
        .filter(t => t.type == 'transfer')
        .filter(t => ['GBP','EUR','USD'].includes(t.currency))
        .filter(t => t.time <= time)
        .map(t => t.amount)
        .reduce((a,x) => a+x, 0)]
    })
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

assertSame(balanceAt({}, 0), [])
assertSame(balanceAt({GBP:[]}, 0), [['GBP',0]])
assertSame(balanceAt({GBP:[{time:0, type:'transfer', amount:10, balance:10}]}, 0), [['GBP',10]])
assertSame(balanceAt({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 0), [['GBP',10]])
assertSame(balanceAt({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 1), [['GBP',20]])
assertSame(balanceAt({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 0.5), [['GBP',10]])
assertSame(balanceAt({BTC:[{time:0, type:'transfer', amount:10, balance:10}]}, 0), [['BTC',10]])
assertSame(balanceAt({GBP:[{time:0, type:'match', amount:10, balance:10}]}, 0), [['GBP',10]])
assertSame(balanceAt({
  GBP:[{time:0, type:'transfer', amount:10, balance:10}],
  BTC:[{time:0, type:'transfer', amount:10, balance:10}],
}, 0), [['GBP',10],['BTC',10]])
assertSame(balanceAt({
  GBP:[{time:0, type:'transfer', amount:10, balance:10}],
  BTC:[{time:1, type:'transfer', amount:10, balance:10}],
}, 0.5), [['GBP',10],['BTC',0]])

assertSame(transferredBy({}, 0), [])
assertSame(transferredBy({GBP:[]}, 0), [['GBP',0]])
assertSame(transferredBy({GBP:[{time:0, type:'transfer', amount:10, balance:10}]}, 0), [['GBP',10]])
assertSame(transferredBy({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 0), [['GBP',10]])
assertSame(transferredBy({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 1), [['GBP',20]])
assertSame(transferredBy({GBP:[
  {time:1, type:'transfer', amount:10, balance:20},
  {time:0, type:'transfer', amount:10, balance:10},
]}, 0.5), [['GBP',10]])
assertSame(transferredBy({GBP:[{time:0, type:'match', amount:10, balance:10}]}, 0), [['GBP',0]])
assertSame(transferredBy({BTC:[{time:0, type:'transfer', amount:10, balance:10}]}, 0), [['BTC',10]])
assertSame(transferredBy({
  GBP:[{time:0, type:'transfer', amount:10, balance:10}],
  BTC:[{time:0, type:'transfer', amount:10, balance:10}],
}, 0), [['GBP',10],['BTC',10]])
