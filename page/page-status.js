const frame =  require('./frame').apply
const os =  require('os')
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  let exchange, data
  try {
    exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
    data = await fetchData(exchange)
  } catch (e) { next(e); return }
  res.send(frame(`
    <h1>${os.hostname()} GDAX status</h1>
    <h3>Accounts</h3>
    ${formatAccounts(data.accounts)}
    <p>Equivalent totals: ${dp(data.totalValueInEur, 2)} EUR, ${dp(data.totalValueInBtc, 4)} BTC</p>
    <h3>Orders</h3>
    ${formatOrders(data.orders)}
    <h3>Trade</h3>
    <h4>Limit Sell</h4>
    <form style="display:inline" action="/trade/limit/sell" method="post">
      <input type="text" name="product" value="BTC-EUR">
      <input type="text" name="amountOfBase" value="0.01">
      <input type="text" name="price" value="${exchange.roundQuote(data.btcEurPrice + 0.01)}">
      <input type="submit" value="Place order">
    </form>
    <h4>Limit Buy</h4>
    <form style="display:inline" action="/trade/limit/buy" method="post">
      <input type="text" name="product" value="BTC-EUR">
      <input type="text" name="amountOfBase" value="0.01">
      <input type="text" name="price" value="${exchange.roundQuote(data.btcEurPrice - 0.01)}">
      <input type="submit" value="Place order">
    </form>
  `))
}
const formatAccounts = (accounts) => {
  const rows = accounts
    .map(a => `<tr>${td(dp4(a.balance) + a.currency)} ${td(dp4(a.available) + a.currency)} ${td(dp4(a.valueInEur) + ' EUR')} </tr>`)
    .join('\n')
  return '<table><tr><th>Balance</th><th>Available</th><th>Value</th></tr>\n'+rows+'</table>'
}

const formatOrders = (orders) => {
  const rows = orders
    .map(o => {
      const baseCurrency = o.product.split('-')[0]
      const quoteCurrency = o.product.split('-')[1]
      const stopReport = o.stop ? `stop ${o.stop} at ${dp4(o.stopPrice)} ${quoteCurrency}: ` : ''
      return `<tr>
                <td>${stopReport}${o.type} ${o.side} ${dp4(o.amount)} ${baseCurrency} at ${dp4(o.price)} ${quoteCurrency}</td>
                <td>created at ${o.created}</td>
                <td>
                  <form id="form-cancel-${o.id}" action="/trade/cancel/${o.id}" method="post"></form>
                  <button onclick="cancelOrder('${o.id}')">&#x1f5d1;</button>
                </td>
              </tr>`
    })
    .join('\n')
    return `<table>
        ${rows}
      </table>
      <script>
        cancelOrder = (id) => {
          if (confirm('Really cancel order '+id+'?')) {
            document.getElementById('form-cancel-'+id).submit()
          }
        }
      </script>`
}

const fetchData = async (exchange) => {
  const result = await exchange.accounts()
  result.orders = await exchange.orders()
  return result
}

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
const dp4 = (x) => dp(x, 4)
const td = (str) => `<td>${str}</td>`
