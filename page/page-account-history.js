const frame =  require('./frame').apply
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const transactions = [{balance:0, time:Date.now()-100*24*60*60*1000}, {balance:100, time:Date.now()}]//Temp test data

  res.send(frame(`
    <h1>Account History</h1>
    <h3>In Eur</h3>
    <canvas id="balances-eur" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <p>
      <span id="TOTAL">Total</span>
      <span id="EUR">EUR</span>
      <span id="GBP">GBP</span>
      <span id="BTC">BTC</span>
      <span id="ETH">ETH</span>
      <span id="LTC">LTC</span>
      <span id="BCH">BCH</span>
      <span id="ETC">ETC</span>
      <span id="ZRX">ZRX</span>
    </p>
    <script src="/draw-labels.js"></script>
    <script src="/account-extents.js"></script>
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
        ZRX: '#00c0c0',
      }
      Object.entries(colours).map(([k,v]) => document.getElementById(k).style='color:'+v)

      const transactions = ${JSON.stringify(transactions)}
      const canvas = document.getElementById('balances-eur')
      const extents = accountExtents(canvas, transactions)
      extents.background()
      drawLabels(canvas, extents)
    </script>
  `))
}


//-------------------

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nAccount history page test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}
