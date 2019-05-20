const frame =  require('./frame').apply
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const btcPriceHistory = (await tracker.pricesOf('BTC-GBP'))
    .map(({at, price}) => {return {time:(Date.parse(at))/1000, price:parseFloat(price), low:parseFloat(price), high:parseFloat(price)}})
    .sort((l,r) => r.time - l.time)

  res.send(frame(`
    <h1>BTC-GBP logarithmic trendline</h1>
    <canvas id="btc-gbp-price" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>
    <script src="/candle-extents.js"></script>
    <script src="/draw-labels.js"></script>
    <script src="/draw-balances.js"></script>
    <script src="/draw-logarithmic-trendline.js"></script>
    <script>
      const btcPriceHistory = ${JSON.stringify(btcPriceHistory)}
      const canvas = document.getElementById('btc-gbp-price')
      const extents = candleExtents(canvas, btcPriceHistory)
      extents.background()
      drawLogarithmicTrendline(canvas, extents)
      drawBalanceLine(canvas, extents, btcPriceHistory.map(({time,price}) => {return {time:time*1000, price}}), t => t.price, '#404040')
      drawLabels(canvas, extents)
    </script>
  `))
}
