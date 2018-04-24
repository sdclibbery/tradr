const { spawn } = require('child_process');
const process = require('process')
const GdaxExchange = require('./gdax-exchange');

exports.cancel = async (req, res, next) => {
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  try {
    await exchange.cancelOrder(req.params.id)
    res.redirect(req.query.next || `/status`)
  } catch (e) {
    res.status(500).send(`GDAX error: ${e}`)
  }
}

exports.limitOrder = async (req, res, next) => {
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  try {
    await exchange.order(req.params.side, req.body.amountOfBase, req.body.price, req.body.product, 'user', req.query.reason)
    res.redirect(req.query.next || `/status`)
  } catch (e) {
    res.status(500).send(`GDAX error: ${e}`)
  }
}

exports.buySellLimitOrder = async (req, res, next) => {
  const exchange = GdaxExchange.createExchange({product: req.body.product}, { debug: () => {}, error: console.log, })
  const reason = `${req.query.reason} buyPrice: ${req.body.buyPrice} sellPrice: ${req.body.sellPrice}`
  try {
    await exchange.buy(req.body.amountOfBase, req.body.buyPrice, 'user', reason)
    await exchange.sell(req.body.amountOfBase, req.body.sellPrice, 'user', reason)
    res.redirect(req.query.next || `/status`)
  } catch (e) {
    res.status(500).send(`GDAX error: ${e}`)
  }
}

exports.buyThenSell = async (req, res, next) => {
  const args = [
    'bot-buy-then-sell.js',
    '-p', req.body.product,
    '-a', req.body.amountOfBase,
    '-t', req.body.targetPrice,
  ]
  const subprocess = spawn(process.argv[0], args, {
    cwd: './bot',
    detached: true,
    stdio: 'ignore',
  })
  subprocess.unref()
  res.redirect(req.query.next || `/bot`)
}

exports.sellThenBuy = async (req, res, next) => {
  const args = [
    'bot-sell-then-buy.js',
    '-p', req.body.product,
    '-a', req.body.amountOfBase,
    '-t', req.body.targetPrice,
  ]
  const subprocess = spawn(process.argv[0], args, {
    cwd: './bot',
    detached: true,
    stdio: 'ignore',
  })
  subprocess.unref()
  res.redirect(req.query.next || `/bot`)
}

const launchBot = () => {

}
