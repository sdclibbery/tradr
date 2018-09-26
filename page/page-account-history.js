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
      const balances = ${JSON.stringify(balances)}
      drawBalances(canvas, balances)
    </script>
  `))
}
