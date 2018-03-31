const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in quote currency, eg in EUR for BTC-EUR' },
  { name: 'stoploss', alias: 's', type: Number, defaultValue: 1, description: 'percentage offset for stoploss exit order' },
])

framework.runBot(async () => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStoploss = (price) => price*(1 - percent/100)

  const startPrice = await exchange.latestPrice()
  const buyInPrice = startPrice - 0.01
  const entryAmountInQuoteCurrency = options.amount
  const entryAmountInBaseCurrency = options.amount / buyInPrice
  logger.info(`BOT: starting ${exchange.formatQuote(entryAmountInQuoteCurrency)} ${options.product} trade from ${exchange.formatQuote(buyInPrice)}`)

  let stoplossPrice = calcStoploss(buyInPrice)
  let stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)

  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()

    const stoplossStatus = await exchange.orderStatus(stoplossId)
    if (stoplossStatus.filled) {
      const exitAmountInQuoteCurrency = stoplossStatus.filledAmountInQuoteCurrency
      logger.sync.info(`BOT: trade complete: ${exchange.formatQuote(entryAmountInQuoteCurrency)}->${exchange.formatQuote(exitAmountInQuoteCurrency)}`)
      break;
    }

    const shouldMoveStoploss = exchange.roundQuote(calcStoploss(newPrice)) > exchange.roundQuote(stoplossPrice)
    if (shouldMoveStoploss) {
      await exchange.cancelOrder(stoplossId)
      stoplossPrice = calcStoploss(newPrice)
      stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)
    }
  }
}, logger)
