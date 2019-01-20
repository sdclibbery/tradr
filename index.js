const express = require('express')
const os =  require('os')
const basicAuth = require('express-basic-auth')
const bcrypt = require('bcrypt')
const request = require('request')
const recorder = require('./recorder')

const port = 8001
const app = express()

app.use(basicAuth({
    authorizer: (username, password) => {
      return username == 'steve' && bcrypt.compareSync(password, '$2a$10$SqywWBhDP76FSYQN/cqcw.aGdYKByNKPbI.XRsdbu.crXb7kuXhJi')
    },
    challenge: true,
    realm: '7ygTF9DFgTh',
}))
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
app.use((req, res, next) => {
  console.log(new Date(), req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.url, req.method)
  next();
});
app.use(express.urlencoded({extended:false}));
app.use(express.static('client'))

app.get('/', require('./page/page-home').render)
app.get('/status', require('./page/page-status').render)
app.get('/trade/:product', require('./page/page-trade-product').render)
app.get('/analyse/:product', require('./page/page-analyse-product').render)
app.get('/account/history', require('./page/page-account-history').render)
app.get('/account/:product', require('./page/page-account-product').render)
app.get('/orders', require('./page/page-orders').render)
app.get('/orders/open', require('./page/page-orders-open').render)
app.get('/orders/filled', require('./page/page-orders-filled').render)
app.get('/orders/cancelled', require('./page/page-orders-cancelled').render)
app.get('/orders/:product', require('./page/page-orders-product').render)
app.post('/trade/cancel/:id', require('./action-trade').cancel)
app.post('/trade/limit/buysell', require('./action-trade').buySellLimitOrder)
app.post('/trade/sellThenBuy', require('./action-trade').sellThenBuy)
app.post('/trade/buyThenSell', require('./action-trade').buyThenSell)
app.post('/trade/limit/:side', require('./action-trade').limitOrder)
app.get('/bot', require('./page/page-bot').render)
app.post('/bot/start/:bot', require('./page/page-bot').start)
app.post('/bot/stop/:bot', require('./page/page-bot').stop)
app.get('/bot/log/:logFile', require('./page/page-bot-log').render)
app.get('/bot/log/:logFile/clear', require('./page/page-bot-log').clearLog)
app.use('/system', (req, res) => req.pipe(request('http://localhost:8000/system'+req.url)).pipe(res))

const expressServer = app.listen(port, () => {
  console.log(`${new Date()} tradr listening on port ${port}`)
})
