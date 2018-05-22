const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const orders = await require('../tracker').getFilledOrders()
  res.send(frame(`
    <h1>Filled Orders</h1>
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
      <td><b>Profit: ${dp2(actualProfit(o))}%</b> at ${o.closeTime}</td>
      <td>by <b>${o.creator}</b> for ${o.reason}</td>
      <td>created at ${o.created}, ${dp4(o.priceAtCreation)} ${quoteCurrency} target ${dp4(o.orderPrice)} ${quoteCurrency}</td>
      </tr>`
    }).join('\n')
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

assert('actualProfit 0', 0, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 100% on sell no fees', 100, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:0, amount:1 }))
assert('actualProfit 10% on sell no fees', 10, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:1100, fees:0, amount:1 }))
assert('actualProfit 50% on sell with fees', 50, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:500, amount:1 }))
assert('actualProfit 90% on sell with fees', 90, actualProfit({ side:'sell', priceAtCreation:1000, fillPrice:2000, fees:100, amount:1 }))
assert('actualProfit 100% on buy no fees', 100, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 10% on buy no fees', 10, actualProfit({ side:'buy', priceAtCreation:1100, fillPrice:1000, fees:0, amount:1 }))
assert('actualProfit 50% on buy with fees', 50, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:500, amount:1 }))
assert('actualProfit 90% on buy with fees', 90, actualProfit({ side:'buy', priceAtCreation:2000, fillPrice:1000, fees:100, amount:1 }))
