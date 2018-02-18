exports.bot = async (options, exchange) => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]

  const calcStoploss = (price) => price*(1 - percent/100)
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const {price: startPrice} = await exchange.waitForPriceChange()
  const buyInPrice = (Number.parseFloat(startPrice) - 0.01).toFixed(2) // Get from data feed min increment and smallest unit
  const entryAmountInBaseCurrency = (options.amount / buyInPrice).toFixed(8) // Get from data feed smallest unit
  console.log(`starting ${entryAmountInBaseCurrency}${quoteCurrency} ${options.product} trade from ${buyInPrice}`)

  if (options.buyin) {
    await exchange.buy(buyInPrice, entryAmountInBaseCurrency)
    console.log(`bought in ${entryAmountInBaseCurrency} at ${buyInPrice}`)
  }

  let stoplossPrice = calcStoploss(buyInPrice)
  console.log(`setting stop loss to: ${dp2(stoplossPrice)}`)
  let {id: stoplossId} = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)

  while (true) {
    const {filled: stoplossFilled, price: newPrice} = await Promise.race([
      exchange.waitForPriceChange(),
      exchange.waitForOrderFill(stoplossId),
    ])

    if (stoplossFilled) {
      const exitAmountInQuoteCurrency = entryAmountInBaseCurrency * stoplossPrice
      console.log(`trade complete: ${dp2(buyInPrice)}->${dp2(stoplossPrice)} ${dp2(entryAmountInBaseCurrency)}${quoteCurrency}->${dp2(exitAmountInQuoteCurrency)}${quoteCurrency}`)
      break;
    }

    const shouldMoveStoploss = calcStoploss(newPrice) > stoplossPrice
    if (shouldMoveStoploss) {
      await exchange.cancelOrder(stoplossId)
      stoplossPrice = calcStoploss(newPrice)
      console.log(`moving stop loss to: ${dp2(stoplossPrice)}`)
      stoplossId = await exchange.stopLoss(stoplossPrice, entryAmountInBaseCurrency)
    }
  }
}
