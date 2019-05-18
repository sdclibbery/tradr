const frame =  require('./frame').apply

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const orders = await require('../tracker').getOrdersForProduct(product)

  res.send(frame(`
    <h1>Analyse ${product}</h1>
    <button onclick="javascript:candleGraph(60,'normal')">5h</button>
    <button onclick="javascript:candleGraph(60,'extend')">5hx</button>
    <button onclick="javascript:candleGraph(300,'normal')">1d</button>
    <button onclick="javascript:candleGraph(300,'extend')">1dx</button>
    <button onclick="javascript:candleGraph(900,'normal')">3d</button>
    <button onclick="javascript:candleGraph(900,'extend')">3dx</button>
    <button onclick="javascript:candleGraph(3600,'normal')">12d</button>
    <button onclick="javascript:candleGraph(3600,'extend')">12dx</button>
    <button onclick="javascript:candleGraph(21600,'normal')">10w</button>
    <button onclick="javascript:candleGraph(21600,'extend')">10wx</button>
    <button onclick="javascript:candleGraph(86400,'normal')">10m</button>
    <button onclick="javascript:candleGraph(86400,'extend')">10mx</button>

    <canvas id="candles" width="1500" height="500" style="width:96vw; height:32vw;"></canvas>

    <script src="/fetch-candles.js"></script>
    <script src="/fetch-order-book.js"></script>
    <script src="/candle-extents.js"></script>
    <script src="/draw-candles.js"></script>
    <script src="/draw-candle-analysis.js"></script>
    <script src="/draw-logarithmic-trendline.js"></script>
    <script src="/draw-orders.js"></script>
    <script src="/draw-order-book.js"></script>
    <script src="/draw-labels.js"></script>
    <script>
      const canvas = document.getElementById('candles')
      const orders = ${JSON.stringify(orders)}
      let extents
      let book
      fetchOrderBook('${product}').then(b => {
        book = b
        if (extents) { drawOrderBook(canvas, book, extents) }
      })
      candleGraph = (granularity, scale) => {
        fetchCandles('${product}', granularity).then(candles => {
          extents = candleExtents(canvas, candles, scale)
          extents.background()
          drawCandleAnalysis(canvas, candles, granularity, extents)
          ${product=='BTC-GBP' ? 'drawLogarithmicTrendline(canvas, extents)' : ''}
          drawOrders(canvas, orders, extents)
          if (book) { drawOrderBook(canvas, book, extents) }
          drawCandles(canvas, candles, granularity, extents)
          drawLabels(canvas, extents)
        })
      }
      candleGraph(60)
    </script>
  `))
}
