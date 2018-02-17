exports.bot = (options, exchange) => {
  const percent = options.stoploss
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  const entryAmountInQuoteCurrency = options.amount
  let exitAmountInQuoteCurrency
  let entryPrice
  let entryTime
  let balanceInBaseCurrency
  let stoplossPrice
  let exitPrice
  let exitTime
  let state
  const marketOrderPrice = undefined

  const stateBegin = (price, time) => {
    entryTime = time
    buyIn(time)
    return `${time} ${dp2(percent)}% starting ${entryAmountInQuoteCurrency}${quoteCurrency} ${options.product} trade`
  }
  state = stateBegin

  const buyIn = () => {
    state = stateWaiting
    exchange.buy(marketOrderPrice, entryAmountInQuoteCurrency, (price, amountOfBaseCurrencyBought) => {
      entryPrice = price
      balanceInBaseCurrency = amountOfBaseCurrencyBought
      state = stateRunning
      setStoploss(entryPrice)
    })
  }

  const setStoploss = (price) => {
    stoplossPrice = calcStoploss(price)
  }

  const calcStoploss = (price) => price*(1 - percent/100)

  const stateRunning = (price, time) => {
    const shouldMoveStoploss = calcStoploss(price) > stoplossPrice
    if (shouldMoveStoploss) {
      clearStoploss()
      setStoploss(price)
      return `${time} ${dp2(percent)}% moving stop loss to: ${dp2(stoplossPrice)}`
    }

    const complete = price <= stoplossPrice
    if (complete) {
      exitPrice = stoplossPrice
      exitTime = time
      state = stateDone
      const exitAmountInQuoteCurrency = balanceInBaseCurrency*exitPrice
      const profit = exitAmountInQuoteCurrency - entryAmountInQuoteCurrency
      return `${time} ${dp2(percent)}% trade complete: ${dp2(entryPrice)}->${dp2(exitPrice)} profit ${dp2(profit)} ${entryTime}-${exitTime}`
    }
  }

  const clearStoploss = () => {
  }

  const stateWaiting = (price, time) => {}
  const stateDone = (price, time) => {}

  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const newBot = (price, time) => {
    return state(price, time.substring(11, 19))
  }
  newBot.done = () => state === stateDone
  return newBot
}
