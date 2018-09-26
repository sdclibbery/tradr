const frame =  require('./frame').minimal
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const balances = await tracker.getBalances()
  res.send(frame(`
    <h1>Account Balance History</h1>
    <canvas id="balances" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <script src="/draw-balances.js"></script>
    <script>
      const canvas = document.getElementById('balances')
      const balances = ${JSON.stringify(ignoreUnchanging(balances))}
      drawBalances(canvas, balances)
    </script>
  `))
}

const ignoreUnchanging = (balances) => {
  let lastBalance
  return balances.filter(b => {
    const changed = b.balance != lastBalance
    lastBalance = b.balance
    return changed
  })
}
