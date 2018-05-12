const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const orders = await require('../tracker').getOpenOrders()
  res.send(frame(`
    <h1>Open Orders</h1>
    <table>
    ${formatOrders(orders)}
    </table>
    <style>
      .side-buy { color:#008000 }
      .side-sell { color:#a00000 }
    </style>
  `))
}

const formatOrders = (orders) => {
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)
  const dp4 = (x) => Number.parseFloat(x).toFixed(4)
  return orders
    .map(o => {
      const baseCurrency = o.product.split('-')[0]
      const quoteCurrency = o.product.split('-')[1]
      return `<tr class="side-${o.side}">
      <td>${o.exchange} ${o.product} <b>${o.side} ${dp4(o.amount)} ${baseCurrency}</b></td>
      <td><b>Target profit: ${dp2(expectedProfit(o))}%</b> ordered at ${dp4(o.priceAtCreation)} ${quoteCurrency} target ${dp4(o.orderPrice)} ${quoteCurrency}</td>
      <td>by <b>${o.creator}</b> for ${o.reason}</td>
      <td>created at ${o.created}</td>
      </tr>`
    }).join('\n')
}

const expectedProfit = (o) => {
  const priceRatio = (o.side == 'sell') ? o.orderPrice/o.priceAtCreation : o.priceAtCreation/o.orderPrice
  return (priceRatio - 1) * 100
}

const assert = (m, e, a) => {
  if (!(Math.abs(e-a)<1e-6)) { console.error('** Test failed\n', m, '\nExpected: ', e, '\nActual: ', a) }
}

assert('expectedProfit 0', 0, expectedProfit({ side:'sell', orderPrice:1000, priceAtCreation:1000 }))
assert('expectedProfit 100% on sell', 100, expectedProfit({ side:'sell', orderPrice:2000, priceAtCreation:1000 }))
assert('expectedProfit 10% on sell', 10, expectedProfit({ side:'sell', orderPrice:1100, priceAtCreation:1000 }))
assert('expectedProfit 100% on buy', 100, expectedProfit({ side:'buy', orderPrice:1000, priceAtCreation:2000 }))
assert('expectedProfit 10% on buy', 10, expectedProfit({ side:'buy', orderPrice:1000, priceAtCreation:1100 }))
