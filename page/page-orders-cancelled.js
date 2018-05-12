const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const orders = await require('../tracker').getUserCancelledOrders()
  res.send(frame(`
    <h1>User Cancelled Orders</h1>
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
      <td>ordered at ${dp4(o.priceAtCreation)} ${quoteCurrency} target ${dp4(o.orderPrice)} ${quoteCurrency}</td>
      <td>by <b>${o.creator}</b> for ${o.reason}</td>
      <td>created at ${o.created}</td>
      </tr>`
    }).join('\n')
}
