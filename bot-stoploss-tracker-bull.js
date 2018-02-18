exports.bot = async (options, exchange) => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  const entryAmountInQuoteCurrency = options.amount

  const calcStoploss = (price) => price*(1 - percent/100)
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  console.log(`starting ${entryAmountInQuoteCurrency}${quoteCurrency} ${options.product} trade`)
  const {price: buyInPrice, amountOfBaseCurrencyBought} = await exchange.buyNow(entryAmountInQuoteCurrency)

  let stoplossPrice = calcStoploss(buyInPrice)
  console.log(`setting stop loss to: ${dp2(stoplossPrice)}`)
  let {id: stoplossId} = await exchange.stopLoss(stoplossPrice, amountOfBaseCurrencyBought)

  while (true) {
    const {filled: stoplossFilled, price: newPrice} = await Promise.race([
      exchange.waitForPriceChange(),
      exchange.waitForOrderFill(stoplossId),
    ])

    if (stoplossFilled) {
      const exitAmountInQuoteCurrency = amountOfBaseCurrencyBought * stoplossPrice
      console.log(`trade complete: ${dp2(buyInPrice)}->${dp2(stoplossPrice)} ${dp2(entryAmountInQuoteCurrency)}${quoteCurrency}->${dp2(exitAmountInQuoteCurrency)}${quoteCurrency}`)
      break;
    }

    const shouldMoveStoploss = calcStoploss(newPrice) > stoplossPrice
    if (shouldMoveStoploss) {
      await exchange.cancelOrder(stoplossId)
      stoplossPrice = calcStoploss(newPrice)
      console.log(`moving stop loss to: ${dp2(stoplossPrice)}`)
      stoplossId = await exchange.stopLoss(stoplossPrice, amountOfBaseCurrencyBought)
    }
  }
}
