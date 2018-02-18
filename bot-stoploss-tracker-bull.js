exports.bot = async (options, exchange) => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStoploss = (price) => price*(1 - percent/100)
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const {price: startPrice} = await exchange.waitForPriceChange()
  const buyInPrice = startPrice - 0.01
  const entryAmountInQuoteCurrency = options.amount
  const entryAmountInBaseCurrency = options.amount / buyInPrice
  console.log(`BOT: starting ${dp2(entryAmountInQuoteCurrency)}${quoteCurrency} ${options.product} trade from ${dp2(buyInPrice)}`)

  if (options.buyin) {
    await exchange.buy(buyInPrice, entryAmountInBaseCurrency)
  }

  let stoplossPrice = calcStoploss(buyInPrice)
  let stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)

  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()

    if (await exchange.orderFilled(stoplossId)) {
      const exitAmountInQuoteCurrency = entryAmountInBaseCurrency * stoplossPrice
      console.log(`BOT: trade complete: ${dp2(buyInPrice)}->${dp2(stoplossPrice)} ${dp2(entryAmountInQuoteCurrency)}${quoteCurrency}->${dp2(exitAmountInQuoteCurrency)}${quoteCurrency}`)
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
