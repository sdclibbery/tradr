exports.trade = (options) => {
  const percent = options.type === 'bull' ? options.stoploss : -options.stoploss
  let entry
  let entry_time
  let stoploss
  let exit
  let exit_time

  const calcStoploss = (price) => price*(1 - percent/100)

  const initial = (price, time) => {
    entry = price
    entry_time = time
    stoploss = calcStoploss(price)
    state = running
    return `* ${options.type} ${percent}% starting trade at ${time} from ${entry}; initial stop loss: ${stoploss}`
  }

  const running = (price, time) => {
    if ((options.type === 'bear' && calcStoploss(price) < stoploss) || (options.type === 'bull' && calcStoploss(price) > stoploss)) {
      stoploss = calcStoploss(price)
      return `* ${options.type} ${percent}% moving stop loss to: ${stoploss}`
    }
    if ((options.type === 'bear' && price >= stoploss) || (options.type === 'bull' && price <= stoploss)) {
      exit = price
      exit_time = time
      state = done
      const profit = options.type === 'bull' ? exit - entry : -(exit - entry)
      return `* ${options.type} ${percent}% trade complete: ${entry}->${exit} profit ${100*profit/entry}% ${entry_time}-${exit_time}`
    }
  }

  const done = (price, time) => {}
  let state = initial

  const newTrade = (price, time) => {
    return state(price, time)
  }
  newTrade.done = () => state === done
  return newTrade
}
