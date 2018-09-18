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
    <script src="/candle-extents.js"></script>
    <script src="/draw-candles.js"></script>
    <script src="/draw-candle-analysis.js"></script>
    <script src="/draw-orders.js"></script>
    <script>
      const orders = [
        {// recent
          status:'filled',
          priceAtCreation:6200,
          created:'2018-09-02T18:36:21.006732Z',
          fillPrice:5355,
          closeTime:'2018-09-17T21:36:21.006732Z',
        },
        { // sellThenBuy
          status:'filled',
          priceAtCreation:7200,
          created:'2018-05-11T14:21:02.362094Z',
          fillPrice:6607,
          closeTime:'2018-05-23T16:15:18.206Z',
        },
        { // buyThenSell
          status:'filled',
          priceAtCreation:5574.88,
          created:'2018-06-12T19:48:41.377677Z',
          fillPrice:5921.0000 ,
          closeTime:'2018-06-19T15:19:56.795Z',
        },
        {
          status:'open',
          priceAtCreation:6505.69,
          created:'2018-06-09T08:55:03.221875Z',
          orderPrice:8827.0000,
        },
        {
          status:'cancelled',
          priceAtCreation:6505.69,
          created:'2018-07-09T08:55:03.221875Z',
          orderPrice:8827.0000,
          closeTime:'2018-07-19T15:19:56.795Z',
        },
      ]
      candleGraph = (granularity) => {
        const canvas = document.getElementById('candles')
        fetchCandles('${product}', granularity).then(candles => {
          const extents = candleExtents(canvas, candles)
          drawCandles(canvas, candles, granularity, extents)
          drawCandleAnalysis(canvas, candles, granularity, extents)
          drawOrders(canvas, orders, extents)
        })
      }
      candleGraph(60)
    </script>
  `))
}
