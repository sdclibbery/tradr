const trade = (percent) => {
  let state = 'empty'
  let type = percent<0 ? 'bear' : 'bull'
  let entry
  let entry_time
  let stop_loss
  let exit
  let exit_time

  return (price, time) => {
    const new_stop_loss = price*(1 - percent/100)
    if (state === 'empty') {
      entry = price
      entry_time = time
      stop_loss = new_stop_loss
      state = 'running'
      return `* ${type} ${percent}% starting trade; stop loss: ${stop_loss}`
    } else if (state === 'running') {
      if ((type === 'bear' && new_stop_loss < stop_loss) || (type === 'bull' && new_stop_loss > stop_loss)) {
        stop_loss = new_stop_loss
        return `* ${type} ${percent}% moving stop loss to: ${stop_loss}`
      }
      if ((type === 'bear' && price >= stop_loss) || (type === 'bull' && price <= stop_loss)) {
        exit = price
        exit_time = time
        state = 'done'
        const profit = entry - exit
        return `* ${type} ${percent}% trade complete: profit ${profit} ${100*profit/entry}% ${entry_time}-${exit_time}`
      }
    }
  }
}

exports.bear = (percent) => {
  return trade(-percent)
}

exports.bull = (percent) => {
  return trade(percent)
}
