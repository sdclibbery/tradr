const frame =  require('./frame').minimal
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const exchange = GdaxExchange.createExchange({product: product}, { debug: () => {}, error: console.log, })
  await exchange.fetchSteps()
  const accounts = await exchange.accounts()
  const baseAccount = accounts.filter(a => a.currency == baseCurrency)[0] || {balance:0, available:0}
  const quoteAccount = accounts.filter(a => a.currency == quoteCurrency)[0] || {balance:0, available:0}

  res.send(frame(`
    Balance: <b>${exchange.formatBase(baseAccount.balance)}</b> <b>${exchange.formatQuote(quoteAccount.balance)}</b><br/>
    Available: <b>${exchange.formatBase(baseAccount.available)}</b> <b>${exchange.formatQuote(quoteAccount.available)}</b><br/>
    <button onclick="document.location.reload()">&#x1f5d8;</button><br/>
  `))
}
