exports.trade = (options, exchange) => {
  const isBull = options.type === 'bull'
  const isBear = options.type === 'bear'
  const percent = isBull ? options.stoploss : -options.stoploss
  let entryPrice
  let entryTime
  let stoploss
  let exitPrice
  let exitTime
  let state

  const stateBegin = (price, time) => {
    entryPrice = price
    entryTime = time
    enterTheMarket(entryPrice)
    setStoploss(entryPrice)
    return `${time} ${options.type} ${dp2(percent)}% starting ${options.amount} ${options.product} trade from ${dp2(entryPrice)}; initial stop loss: ${dp2(stoploss)}`
  }
  state = stateBegin

  const stateRunning = (price, time) => {
    const bearShouldMoveStoploss = isBear && calcStoploss(price) < stoploss
    const bullShouldMoveStoploss = isBull && calcStoploss(price) > stoploss
    if (bearShouldMoveStoploss || bullShouldMoveStoploss) {
      clearStoploss()
      setStoploss(price)
      return `${time} ${options.type} ${dp2(percent)}% moving stop loss to: ${dp2(stoploss)}`
    }

    const bearComplete = isBear && price >= stoploss
    const bullComplete = isBull && price <= stoploss
    if (bearComplete || bullComplete) {
      exitPrice = price
      exitTime = time
      state = stateDone
      const profitPercent = (isBull ? 1 : -1) * 100 * (exitPrice - entryPrice) / entryPrice
      return `${time} ${options.type} ${dp2(percent)}% trade complete: ${dp2(entryPrice)}->${dp2(exitPrice)} profit ${dp2(profitPercent)}% ${entryTime}-${exitTime}`
    }
  }

  const stateWaiting = (price, time) => {}
  const stateDone = (price, time) => {}

  const calcStoploss = (price) => price*(1 - percent/100)

  const dp2 = (x) => Number.parseFloat(x).toFixed(2)

  const enterTheMarket = (price) => {
    state = stateWaiting
    const marketPrice = undefined
    exchange[isBull?'buy':'sell'](marketPrice, options.amount, () => {
      state = stateRunning
    })
  }

  const setStoploss = (price) => {
    stoploss = calcStoploss(price)
  }

  const clearStoploss = () => {
  }

  const newTrade = (price, time) => {
    return state(price, time.substring(11, 19))
  }
  newTrade.done = () => state === stateDone
  return newTrade
}
