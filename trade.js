exports.trade = (options) => {
  const percent = options.type === 'bull' ? options.stoploss : -options.stoploss
  let state = 'empty'
  let entry
  let entry_time
  let stoploss
  let exit
  let exit_time

  const newTrade = (price, time) => {
    const new_stoploss = price*(1 - percent/100)
    if (state === 'empty') {
      entry = price
      entry_time = time
      stoploss = new_stoploss
      state = 'running'
      return `* ${options.type} ${percent}% starting trade at ${time} from ${entry}; initial stop loss: ${stoploss}`
    } else if (state === 'running') {
      if ((options.type === 'bear' && new_stoploss < stoploss) || (options.type === 'bull' && new_stoploss > stoploss)) {
        stoploss = new_stoploss
        return `* ${options.type} ${percent}% moving stop loss to: ${stoploss}`
      }
      if ((options.type === 'bear' && price >= stoploss) || (options.type === 'bull' && price <= stoploss)) {
        exit = price
        exit_time = time
        state = 'done'
        const profit = options.type === 'bull' ? exit - entry : -(exit - entry)
        return `* ${options.type} ${percent}% trade complete: ${entry}->${exit} profit ${100*profit/entry}% ${entry_time}-${exit_time}`
      }
    }
  }
  newTrade.done = () => state == 'done'
  return newTrade
}
