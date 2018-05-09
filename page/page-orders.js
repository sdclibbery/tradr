const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const orders = await require('../tracker').getOrdersWithoutBotCancellations()
  res.send(frame(`
    <h1>Orders</h1>
    <table>
    ${formatOrders(orders)}
    </table>
    <style>
      .side-buy { color:#008000 }
      .side-sell { color:#a00000 }
      .status-cancelled { color:#a0a0a0 }
      .side-buy.status-filled { color:#709070 }
      .side-sell.status-filled { color:#a07070 }
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
      return `<tr class="status-${o.status} side-${o.side}">
      <td>${o.exchange} ${o.product}</td>
      <td>${o.status} <b>${o.side}</b></td>
      <td><b>${dp4(o.amount)} ${baseCurrency}</b></td>
      <td><b>Ordered at ${dp4(o.priceAtCreation)} ${quoteCurrency}</b></td>
      <td><b>Target ${dp4(o.orderPrice)} ${quoteCurrency}</b></td>
      <td><b>Filled at ${dp4(o.fillPrice)} ${quoteCurrency}</b></td>
      <td>created at ${o.created} at price ${dp4(o.priceAtCreation)} ${quoteCurrency}</td>
      <td>Expected profit: ${dp2(expectedProfit(o))}%</td>
      <td>Actual profit: ${dp2(actualProfit(o))}%</td>
      <td>${o.creator} for ${o.reason}</td>
      </tr>`
    }).join('\n')
}

const expectedProfit = (o) => {
  const priceRatio = (o.side == 'sell') ? o.orderPrice/o.priceAtCreation : o.priceAtCreation/o.orderPrice
  return (priceRatio - 1) * 100
}

const actualProfit = (o) => {
  if (o.side == 'sell') {
    const amountOfQuoteAtOrderPlacement = o.amount * o.priceAtCreation
    const amountOfQuoteAtFill = o.amount * o.fillPrice - o.fees
    const quoteRatio = amountOfQuoteAtFill/amountOfQuoteAtOrderPlacement
    return (quoteRatio - 1) * 100
  } else {
    const amountOfQuoteAtOrderPlacement = o.amount * o.priceAtCreation - o.fees
    const amountOfQuoteAtFill = o.amount * o.fillPrice
    const quoteRatio = amountOfQuoteAtOrderPlacement/amountOfQuoteAtFill
    return (quoteRatio - 1) * 100
  }
}

const assert = (m, e, a) => {
  if (!(Math.abs(e-a)<1e-6)) { console.error('** Test failed\n', m, '\nExpected: ', e, '\nActual: ', a) }
}

assert('expectedProfit 0', 0, expectedProfit({ side:'sell', orderPrice:1000, priceAtCreation:1000 }))
assert('expectedProfit 100% on sell', 100, expectedProfit({ side:'sell', orderPrice:2000, priceAtCreation:1000 }))
assert('expectedProfit 10% on sell', 10, expectedProfit({ side:'sell', orderPrice:1100, priceAtCreation:1000 }))
assert('expectedProfit 100% on buy', 100, expectedProfit({ side:'buy', orderPrice:1000, priceAtCreation:2000 }))
assert('expectedProfit 10% on buy', 10, expectedProfit({ side:'buy', orderPrice:1000, priceAtCreation:1100 }))

assert('actualProfit 0', 0, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 100% on sell no fees', 100, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:0, amount:1 }))
assert('actualProfit 10% on sell no fees', 10, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:1100, fees:0, amount:1 }))
assert('actualProfit 50% on sell with fees', 50, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:500, amount:1 }))
assert('actualProfit 90% on sell with fees', 90, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:100, amount:1 }))
assert('actualProfit 100% on buy no fees', 100, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 10% on buy no fees', 10, actualProfit({ side:'buy', priceAtCreation:1100, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 50% on buy with fees', 50, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:500, amount:1 }))
assert('actualProfit 90% on buy with fees', 90, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:100, amount:1 }))
