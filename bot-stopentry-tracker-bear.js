const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in quote currency, eg in EUR for BTC-EUR' },
  { name: 'stopentry', alias: 's', type: Number, defaultValue: 1, description: 'percentage offset for stopentry exit order' },
])

framework.runBot(async () => {
  const percent = options.stopentry
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStopentry = (price) => price*(1 + percent/100)

  const {price: startPrice} = await exchange.waitForPriceChange()
  const sellInPrice = startPrice + 0.01
  const entryAmountInQuoteCurrency = options.amount
  const entryAmountInBaseCurrency = options.amount / sellInPrice
  logger.info(`BOT: starting ${exchange.formatQuote(entryAmountInQuoteCurrency)} ${options.product} trade from ${exchange.formatQuote(sellInPrice)}`)

  let stopentryPrice = calcStopentry(sellInPrice)
console.log(sellInPrice, stopentryPrice, entryAmountInBaseCurrency)
  let stopentryId = await exchange.stopEntry(stopentryPrice, entryAmountInBaseCurrency)

  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()

    const stopentryStatus = await exchange.orderStatus(stopentryId)
    if (stopentryStatus.filled) {
      const exitAmountInQuoteCurrency = stopentryStatus.filledAmountInQuoteCurrency
      logger.info(`BOT: trade complete: ${exchange.formatQuote(entryAmountInQuoteCurrency)}->${exchange.formatQuote(exitAmountInQuoteCurrency)}`)
      break;
    }

    const shouldMoveStopentry = calcStopentry(newPrice) < stopentryPrice
    if (shouldMoveStopentry) {
      await exchange.cancelOrder(stopentryId)
      stopentryPrice = calcStopentry(newPrice)
      stopentryId = await exchange.stopEntry(stopentryPrice, entryAmountInBaseCurrency)
    }
  }
}, logger)
