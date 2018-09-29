const frame =  require('./frame').minimal
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const balances = byDate(await tracker.getBalances())
  res.send(frame(`
    <h1>Account Balance History</h1>
    <canvas id="balances" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <script src="/draw-balances.js"></script>
    <script>
      const canvas = document.getElementById('balances')
      const balances = ${JSON.stringify(balances)}
      drawBalances(canvas, balances)
    </script>
  `))
}

const byDate = (balances) => {
  return balances
    .sort((a,b) => Date.parse(a.at) - Date.parse(b.at))
    .reduce(combineByDate, [])
}

const combineByDate = (dates, balance) => {
  let date = dates[dates.length-1]
  if (!date || balance.at !== date.at) {
    date = { at:balance.at }
    dates.push(date)
  }
  date[balance.currency] = { valueInEur: balance.valueInEur, valueInBtc: balance.valueInBtc }
  return dates
}
