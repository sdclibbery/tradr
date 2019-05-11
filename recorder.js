const GdaxExchange = require('./gdax-exchange')
const tracker = require('./tracker')

const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

const trackOrders = async () => {
  console.log(new Date(), ' Tracking orders')
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  await exchange.orders()
  console.log(new Date(), ' Tracking orders: Done')
}
setTimeout(trackOrders, 20*1000)
setInterval(trackOrders, 60*60*1000)
