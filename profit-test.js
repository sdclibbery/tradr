const logger = {
  info: () => {},
  warn: () => {},
  sync: {
    info: () => {},
    warn: () => {},
  }
}

const options = { product: 'BTC-EUR', amount: 100, stoploss: 1 }

const exchange = {
  roundQuote: (x) => x,
  roundBase: (x) => x,
  formatQuote: () => 'fmtq',
  formatBase: () => 'fmtb',
  latestPrice: async () => await 1,
  stopLoss: async () => await 'stopLoss-id',
  waitForPriceChange: async () => await { price: 1.1 },
  orderStatus: async () => await { filled: true, filledAmountInQuoteCurrency: 100 },
  cancelOrder: async () => await {},
}

const framework = {
  initBot: () => { return { options, logger, exchange} },
  runBot: (bot) => {
    bot().then(() => console.log('test complete'))
  },
}
process.framework = framework

require('./bot-stoploss-tracker-bull')
