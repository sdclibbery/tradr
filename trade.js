exports.trade = (options) => {
  const percent = options.type === 'bull' ? options.stoploss : -options.stoploss
  let entryPrice
  let entryTime
  let stoploss
  let exitPrice
  let exitTime

  const calcStoploss = (price) => price*(1 - percent/100)
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const initial = (price, time) => {
    entryPrice = price
    entryTime = time
    stoploss = calcStoploss(price)
    state = running
    return `${time} ${options.type} ${dp2(percent)}% starting ${options.amount} ${options.product} trade from ${dp2(entryPrice)}; initial stop loss: ${dp2(stoploss)}`
  }

  const running = (price, time) => {
    const bearShouldMoveStoploss = options.type === 'bear' && calcStoploss(price) < stoploss
    const bullShouldMoveStoploss = options.type === 'bull' && calcStoploss(price) > stoploss
    if (bearShouldMoveStoploss || bullShouldMoveStoploss) {
      return `${time} ${moveStoploss(calcStoploss(price))}`
    }

    const bearComplete = options.type === 'bear' && price >= stoploss
    const bullComplete = options.type === 'bull' && price <= stoploss
    if (bearComplete || bullComplete) {
      exitPrice = price
      exitTime = time
      state = done
      const profitPercent = (options.type === 'bull' ? 1 : -1) * 100 * (exitPrice - entryPrice) / entryPrice
      return `${time} ${options.type} ${dp2(percent)}% trade complete: ${dp2(entryPrice)}->${dp2(exitPrice)} profit ${dp2(profitPercent)}% ${entryTime}-${exitTime}`
    }
  }

  const done = (price, time) => {}
  let state = initial

  const moveStoploss = (newStoploss) => {
    stoploss = newStoploss
    return `${options.type} ${dp2(percent)}% moving stop loss to: ${dp2(stoploss)}`
  }

  const newTrade = (price, time) => {
    return state(price, time.substring(11, 19))
  }
  newTrade.done = () => state === done
  return newTrade
}
