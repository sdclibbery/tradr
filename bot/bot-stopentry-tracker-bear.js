const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'coinbasepro product' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in quote currency, eg in EUR for BTC-EUR' },
  { name: 'stopentry', alias: 's', type: Number, defaultValue: 1, description: 'percentage offset for stopentry exit order' },
])
.then(async ({ options, logger, exchange }) => {
  const percent = options.stopentry
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStopentry = (price) => price*(1 + percent/100)

  const startPrice = exchange.latestPrice()
  const sellInPrice = startPrice + 0.01
  const entryAmountInQuoteCurrency = options.amount
  const entryAmountInBaseCurrency = options.amount / sellInPrice
  logger.warn(`BOT: starting ${exchange.formatQuote(entryAmountInQuoteCurrency)} ${options.product} trade from ${exchange.formatQuote(sellInPrice)}`)

  let stopentryPrice = calcStopentry(sellInPrice)

  let stopentryId = await exchange.stopEntry(stopentryPrice, entryAmountInBaseCurrency)

  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()

    const stopentryStatus = await exchange.orderStatus(stopentryId)
    if (stopentryStatus.filled) {
      const exitAmountInQuoteCurrency = stopentryStatus.filledAmountInQuoteCurrency
      logger.sync.warn(`BOT: trade complete: ${exchange.formatQuote(entryAmountInQuoteCurrency)}->${exchange.formatQuote(exitAmountInQuoteCurrency)}`)
      const profitInQuoteCurrency = exitAmountInQuoteCurrency - entryAmountInQuoteCurrency
      return profitInQuoteCurrency
    }

    const newStopentryPrice = calcStopentry(newPrice)
    const shouldMoveStopentry = exchange.roundQuote(newStopentryPrice) < exchange.roundQuote(stopentryPrice)
    if (shouldMoveStopentry) {
      await exchange.cancelOrder(stopentryId)
      stopentryPrice = newStopentryPrice
      stopentryId = await exchange.stopEntry(stopentryPrice, entryAmountInBaseCurrency)
      logger.info(`BOT: Moved stopentry to ${exchange.formatQuote(stopentryPrice)}`)
    }
  }
})
.then(framework.close)
.catch(framework.handleError)
