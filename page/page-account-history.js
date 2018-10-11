const frame =  require('./frame').apply
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const balances = byDate(await tracker.getBalances())
  res.send(frame(`
    <h1>Account Balance History</h1>
    <h3>In Eur</h3>
    <canvas id="balances" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <p>
      <span id="TOTAL">Total</span>
      <span id="EUR">EUR</span>
      <span id="GBP">GBP</span>
      <span id="BTC">BTC</span>
      <span id="ETH">ETH</span>
      <span id="LTC">LTC</span>
      <span id="BCH">BCH</span>
      <span id="ETC">ETC</span>
    </p>
    <script src="/draw-balances.js"></script>
    <script src="/draw-labels.js"></script>
    <script>
      const colours = {
        TOTAL: '#000000',
        EUR: '#707070',
        GBP: '#c0c0c0',
        BTC: '#c00000',
        ETH: '#00c000',
        LTC: '#0000c0',
        BCH: '#c05050',
        ETC: '#50c050',
      }
      Object.entries(colours).map(([k,v]) => document.getElementById(k).style='color:'+v)
      const canvas = document.getElementById('balances')
      const balances = ${JSON.stringify(balances)}
      drawBalances(canvas, balances, colours)
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
  if (!date || !datesAreClose(balance.at, date.at)) {
    date = { at:balance.at }
    dates.push(date)
  }
  date[balance.currency] = { valueInEur: balance.valueInEur, valueInBtc: balance.valueInBtc }
  return dates
}

const datesAreClose = (a, b) => {
  return Math.abs(Date.parse(a) - Date.parse(b)) < 10000
}
