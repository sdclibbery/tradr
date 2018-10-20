const frame =  require('./frame').apply
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const exchange = GdaxExchange.createExchange({product: product}, { debug: () => {}, error: console.log, })
  const price = exchange.latestPrice()
  const orders = await require('../tracker').getOrdersForProduct(product)

  res.send(frame(`
    <style>input[type="number"] { width:80px }</style>
    <h1>Trade ${product}</h1>

    <h3>Price/Candles</h3>
    <button onclick="javascript:candleGraph(60)">5h</button>
    <button onclick="javascript:candleGraph(300)">1d</button>
    <button onclick="javascript:candleGraph(900)">3d</button>
    <button onclick="javascript:candleGraph(3600)">12d</button>
    <button onclick="javascript:candleGraph(21600)">10w</button>
    <button onclick="javascript:candleGraph(86400)">10m</button>
    <div style="overflow-x:auto; direction:rtl; width:100%; padding:0;">
      <canvas id="candles" width="1500" height="500" style="width:750px; height:250px; margin:0;"></canvas>
    </div>
    <p><span id="price">${price}</span> ${quoteCurrency}</p>

    <h3>Account</h3>
    <iframe src="/account/${product}" style="width: 100%; height: 80px;"></iframe>

    <h3>Trade</h3>
    <h4>Price fluctuating without major trend</h4>
    <form style="display:inline" action="/trade/limit/buysell?next=%2Ftrade%2F${product}&reason=buy+and+sell+above+and+below+current+price" method="post">
      <input type="hidden" name="product" value="${product}">
      Trade <input type="number" name="amountOfBase" value="${exchange.baseStep*10}" step="${exchange.baseStep}"> ${baseCurrency}<br>
      Price will fall to <input type="number" name="buyPrice" value="${exchange.roundQuote(price * 0.995)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      Price will rise to <input type="number" name="sellPrice" value="${exchange.roundQuote(price * 1.005)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      <input type="submit" value="Place orders"><br>
    </form>
    <h4>Price is going to rise</h4>
    <form style="display:inline" action="/trade/buyThenSell?next=%2Ftrade%2F${product}" method="post">
      <input type="hidden" name="product" value="${product}">
      Trade <input type="number" name="amountOfBase" value="${exchange.baseStep*10}" step="${exchange.baseStep}"> ${baseCurrency}<br>
      Price will rise to <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 1.005)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      <input type="submit" value="Buy then Sell"><br>
    </form>
    <h4>Price is going to fall</h4>
    <form style="display:inline" action="/trade/sellThenBuy?next=%2Ftrade%2F${product}" method="post">
      <input type="hidden" name="product" value="${product}">
      Trade <input type="number" name="amountOfBase" value="${exchange.baseStep*10}" step="${exchange.baseStep}"> ${baseCurrency}<br>
      Price will fall to <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 0.995)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      <input type="submit" value="Sell then Buy"><br>
    </form>

    <h3>Orders</h3>
    <iframe src="/orders/${product}" style="width: 100%; height: 160px;"></iframe>

    <script src="/fetch-candles.js"></script>
    <script src="/draw-candles.js"></script>
    <script src="/candle-extents.js"></script>
    <script src="/draw-orders.js"></script>
    <script src="/draw-labels.js"></script>
    <script>
    const orders = ${JSON.stringify(orders)}
      candleGraph = (granularity) => {
        const canvas = document.getElementById('candles')
        fetchCandles('${product}', granularity).then(candles => {
          const extents = candleExtents(canvas, candles, 'normal')
          extents.background()
          drawOrders(canvas, orders, extents)
          drawLabels(canvas, extents)
          drawCandles(canvas, candles, granularity, extents)
        })
      }
      candleGraph(60);
    </script>
  `))
}
