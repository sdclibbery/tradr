const options = { product: 'BTC-EUR', amount: 100, stoploss: 1 }
let price
const nextPrice = () => {
  if (price == undefined) {
    price = 5000
  } else {
    price *= Math.pow((0.995 + 0.01*Math.random()), 0.05)
  }
  return price
}
let stoplossOrderPrice, stoplossOrderAmountInBase
const exchange = {
  roundQuote: (x) => x,
  roundBase: (x) => x,
  formatQuote: (x) => x + ' EUR',
  formatBase: (x) => x + ' BTC',
  latestPrice: async () => await nextPrice(),
  stopLoss: async (stoplossPrice, amountOfBaseCurrency) => {
    stoplossOrderPrice = stoplossPrice
    stoplossOrderAmountInBase = amountOfBaseCurrency
    return await 'stoplossOrderPrice-id'
  },
  waitForPriceChange: async () => await { price: nextPrice() },
  orderStatus: async (id) => {
    if (id == 'stoplossOrderPrice-id') {
      if (price < stoplossOrderPrice)  {
        const stoplossOrderAmountInQuote = stoplossOrderAmountInBase * price
        const marketOrderFeePercent = 0.25
        const fees = stoplossOrderAmountInQuote * marketOrderFeePercent/100
        return await { filled: true, filledAmountInQuoteCurrency: stoplossOrderAmountInQuote - fees }
      } else {
        return await { filled: false }
      }
    }
  },
  cancelOrder: async () => {
    stoplossOrderPrice = null
    return await undefined
  },
}

const logger = {
  info: console.log,
  warn: console.log,
  sync: {
    info: console.log,
    warn: console.log,
  }
}
const framework = {
  initBot: () => { return { options, logger, exchange} },
  runBot: (bot) => {
    bot().then(() => console.log('test complete'))
  },
}
process.framework = framework

require('./bot-stoploss-tracker-bull')
