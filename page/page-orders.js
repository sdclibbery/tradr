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
      <td>by ${o.creator} for ${o.reason}</td>
      </tr>`
    }).join('\n')
}
