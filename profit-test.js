const logger = {
  info: console.log,
  warn: console.log,
  sync: {
    info: console.log,
    warn: console.log,
  }
}

const options = { product: 'BTC-EUR', amount: 100, stoploss: 1 }

let price = 1
const nextPrice = () => {
  price *= Math.pow((0.95 + 0.1*Math.random()), 0.1)
  console.log('new price: ', price)
  return price
}
let stopLoss
const exchange = {
  roundQuote: (x) => x,
  roundBase: (x) => x,
  formatQuote: (x) => x,
  formatBase: (x) => x,
  latestPrice: async () => await nextPrice(),
  stopLoss: async (stoplossPrice) => {
    stopLoss = stoplossPrice
    return await 'stopLoss-id'
  },
  waitForPriceChange: async () => await { price: nextPrice() },
  orderStatus: async () => {
    if (price < stopLoss)  {
      return await { filled: true, filledAmountInQuoteCurrency: (100*stopLoss - 100*0.0025/*fees*/) }
    } else {
      return await { filled: false }
    }
  },
  cancelOrder: async () => {
    stopLoss = null
    return await undefined
  },
}

const framework = {
  initBot: () => { return { options, logger, exchange} },
  runBot: (bot) => {
    bot().then(() => console.log('test complete'))
  },
}
process.framework = framework

require('./bot-stoploss-tracker-bull')
