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

const trackPrice = () => {
  const exchange = GdaxExchange.createExchange({}, { debug: () => {}, error: console.log, })
  const prices = exchange.allPrices()
  console.log(`${new Date()} Tracking prices`)
  prices.products.forEach(product => {
    const price = prices[product]
    if (!!price) {
      console.log(`${new Date()} Tracking price of ${product}: ${price}`)
      const date = new Date(prices.at)
      tracker.trackPrice({
        $at: date.toUTCString(),
        $product: product,
        $price: price,
        $epochTimeStamp:(date.getTime()),
      }).catch(console.log)
    }
  })
}
setTimeout(trackPrice, 40*1000)
setInterval(trackPrice, 24*60*60*1000)
