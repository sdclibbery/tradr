const frame =  require('./frame').minimal
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const exchange = GdaxExchange.createExchange({product: product}, { debug: () => {}, error: console.log, })
  await exchange.fetchSteps()
  const orders = await exchange.orders()
  const formattedOrders = orders
    .filter(o => o.product == product)
    .map(o => {
      const stopReport = o.stop ? `stop ${o.stop} at ${exchange.formatQuote(o.stopPrice)} ${quoteCurrency}: ` : ''
      return `<tr><td>${stopReport}${o.type} <b>${o.side}</b> ${exchange.formatBase(o.amount)} at <b>${exchange.formatQuote(o.price)}</b></td><td>created at ${o.created}</td></tr>`
    })
    .join('\n')

  res.send(frame(`
    <table>${formattedOrders}</table>
    <button onclick="document.location.reload()">&#x1f5d8;</button><br/>
  `))
}
