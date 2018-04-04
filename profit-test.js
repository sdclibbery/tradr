const fs = require('fs')

const numRuns = 1000

let price, fd, buffer, index
const resetSampleData = () => {
  fd = fs.openSync('data/BTC-EUR-price-deltas', 'r')
  buffer = Buffer.alloc(1024, ' ')
  index = 0
  price = 5000
}
const nextLine = () => {
  let lineEndIndex = buffer.indexOf('\n', index)
  let line = buffer.toString(undefined, index)
  if (lineEndIndex == -1) {
    if (fs.readSync(fd, buffer, 0, buffer.length, null) < buffer.length) {
      throw 'run out of sample data!'
    }
    index = 0
    lineEndIndex = buffer.indexOf('\n', index)
    line += buffer.toString(undefined, index, lineEndIndex)
  } else {
    line = buffer.toString(undefined, index, lineEndIndex)
  }
  index = lineEndIndex+1
  return line.trim()
}
const nextPrice = () => {
  price += Number.parseFloat(nextLine())
  return price
}

const options = { product: 'BTC-EUR', amount: 100, stoploss: 1, stopentry: 1 }
let stopOrderPrice, stopOrderAmountInBase
const exchange = {
  roundQuote: (x) => x,
  roundBase: (x) => x,
  formatQuote: (x) => x + ' EUR',
  formatBase: (x) => x + ' BTC',
  latestPrice: async () => await nextPrice(),
  stopLoss: async (stoplossPrice, amountOfBaseCurrency) => {
    stopOrderPrice = stoplossPrice
    stopOrderAmountInBase = amountOfBaseCurrency
    return await 'stopLossOrderPrice-id'
  },
  stopEntry: async (stopentryPrice, amountOfBaseCurrency) => {
    stopOrderPrice = stopentryPrice
    stopOrderAmountInBase = amountOfBaseCurrency
    return await 'stopEntryOrderPrice-id'
  },
  waitForPriceChange: async () => await { price: nextPrice() },
  orderStatus: async (id) => {
    if ((id == 'stopLossOrderPrice-id' && price < stopOrderPrice) || (id == 'stopEntryOrderPrice-id' && price > stopOrderPrice))  {
      const stopOrderAmountInQuote = stopOrderAmountInBase * price
      const marketOrderFeePercent = 0.25
      const fees = stopOrderAmountInQuote * marketOrderFeePercent/100
      return await { filled: true, filledAmountInQuoteCurrency: stopOrderAmountInQuote - fees }
    } else {
      return await { filled: false }
    }
  },
  cancelOrder: async () => {
    stopOrderPrice = null
    return await undefined
  },
}

const logger = {
  info: () => {},//console.log,
  warn: console.log,
  sync: {
    info: console.log,
    warn: console.log,
  }
}
const framework = {
  initBot: () => { return { options, logger, exchange} },
  runBot: (bot) => {
    let totalProfit = 0
    let p = Promise.resolve()
    resetSampleData()
    for (let i=0; i < numRuns; i++) {
      p = p.then(resetSampleData).then(bot).then(profit => totalProfit += profit)
    }
    p.then(() => console.log('Average profit on 100 EUR per run: ', totalProfit/numRuns, ' EUR') )
  },
}
process.framework = framework

require('./bot-stopentry-tracker-bear')
//require('./bot-stoploss-tracker-bull')
