const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const orders = await require('../tracker').getOrdersForProduct(product)

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
    <script src="/fetch-order-book.js"></script>
    <script src="/candle-extents.js"></script>
    <script src="/draw-candles.js"></script>
    <script src="/draw-candle-analysis.js"></script>
    <script src="/draw-orders.js"></script>
    <script src="/draw-order-book.js"></script>
    <script src="/draw-labels.js"></script>
    <script>
      const canvas = document.getElementById('candles')
      const orders = ${JSON.stringify(orders)}
      fetchOrderBook('${product}').then(book => {
        candleGraph = (granularity) => {
          let extents
          fetchCandles('${product}', granularity).then(candles => {
            extents = candleExtents(canvas, candles)
            extents.background()
            drawCandleAnalysis(canvas, candles, granularity, extents)
            drawOrders(canvas, orders, extents)
            drawLabels(canvas, extents)
            drawOrderBook(canvas, book, extents)
            drawCandles(canvas, candles, granularity, extents)
          })
        }
        candleGraph(60)
      })
    </script>
  `))
}
