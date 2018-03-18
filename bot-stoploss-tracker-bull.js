const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product; defaults to BTC-EUR' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in quote currency, eg in EUR for BTC-EUR; *must* be specified' },
  { name: 'stoploss', alias: 's', type: Number, defaultValue: 1, description: 'percentage offset for stoploss exit order; defaults to 1' },
])

const bot = async () => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStoploss = (price) => price*(1 - percent/100)
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const {price: startPrice} = await exchange.waitForPriceChange()
  const buyInPrice = startPrice - 0.01
  const entryAmountInQuoteCurrency = options.amount
  const entryAmountInBaseCurrency = options.amount / buyInPrice
  logger.warn(`BOT: starting ${dp2(entryAmountInQuoteCurrency)}${quoteCurrency} ${options.product} trade from ${dp2(buyInPrice)}`)

  let stoplossPrice = calcStoploss(buyInPrice)
  let stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)

  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()

    const stoplossStatus = await exchange.orderStatus(stoplossId)
    if (stoplossStatus.filled) {
      const exitAmountInQuoteCurrency = stoplossStatus.filledAmountInQuoteCurrency
      logger.warn(`BOT: trade complete: ${dp2(entryAmountInQuoteCurrency)}${quoteCurrency}->${dp2(exitAmountInQuoteCurrency)}${quoteCurrency}`)
      break;
    }

    const shouldMoveStoploss = calcStoploss(newPrice) > stoplossPrice
    if (shouldMoveStoploss) {
      await exchange.cancelOrder(stoplossId)
      stoplossPrice = calcStoploss(newPrice)
      stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)
    }
  }
}
bot().then(() => { process.exit() })
