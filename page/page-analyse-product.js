const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]

  res.send(frame(`
    <h1>Analyse ${product}</h1>
    <button onclick="javascript:candleGraph(60)">5h</button>
    <button onclick="javascript:candleGraph(300)">1d</button>
    <button onclick="javascript:candleGraph(900)">3d</button>
    <button onclick="javascript:candleGraph(3600)">12d</button>
    <button onclick="javascript:candleGraph(21600)">10w</button>
    <button onclick="javascript:candleGraph(86400)">10m</button>

    <canvas id="candles" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>

    <script src="/fetch-candles.js"></script>
    <script src="/draw-candles.js"></script>
    <script src="/draw-candle-analysis.js"></script>
    <script>
      candleGraph = (granularity) => {
        fetchCandles('${product}', granularity).then(candles => {
          drawCandles(document.getElementById('candles'), candles, granularity)
          drawCandleAnalysis(document.getElementById('candles'), candles, granularity)
        })
      }
      candleGraph(60);
    </script>
  `))
}
