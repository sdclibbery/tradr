const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const orders = await require('../order-tracker').getOrders()
  res.send(frame(`
    <h1>Orders</h1>
    <table>
    ${formatOrders(orders)}
    </table>
    <style>
      .side-buy { color:#008000 }
      .side-sell { color:#a00000 }
      .status-cancelled { color:#a0a0a0 }
    </style>
  `))
}

const formatOrders = (orders) => {
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)
  const dp4 = (x) => Number.parseFloat(x).toFixed(4)
  return orders
    .map(o => {
      const profit = (o.side == 'buy' ? 1 : 1) * (o.orderPrice/o.priceAtCreation - 1) * 100
      const baseCurrency = o.product.split('-')[0]
      const quoteCurrency = o.product.split('-')[1]
      return `<tr class="status-${o.status} side-${o.side}">
      <td>${o.exchange} ${o.product}</td>
      <td>${o.status} <b>${o.side}</b></td>
      <td><b>${dp4(o.amount)} ${baseCurrency}</b></td>
      <td><b>${dp4(o.orderPrice)} ${quoteCurrency}</b></td>
      <td>created at ${o.created} at price ${dp4(o.priceAtCreation)} ${quoteCurrency}</td>
      <td>Profit if filled: ${dp2(profit)}%</td>
      <td>${o.creator} for ${o.reason}</td>
      </tr>`
    }).join('\n')
}
