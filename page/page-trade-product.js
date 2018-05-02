const frame =  require('./frame').apply
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const exchange = GdaxExchange.createExchange({product: product}, { debug: () => {}, error: console.log, })
  await exchange.fetchSteps()
  const price = await exchange.latestPrice()

  res.send(frame(`
    <style>input[type="number"] { width:80px }</style>
    <h1>Trade ${product}</h1>

    <h3>Price/Candles</h3>
    <button onclick="javascript:candles(60)">1m</button>
    <button onclick="javascript:candles(300)">5m</button>
    <button onclick="javascript:candles(900)">15m</button>
    <button onclick="javascript:candles(3600)">1h</button>
    <button onclick="javascript:candles(21600)">6h</button>
    <button onclick="javascript:candles(86400)">1d</button>
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
      Trade <input type="number" name="amountOfBase" value="${exchange.baseStep*10}"> ${baseCurrency}<br>
      Price will rise to <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 1.005)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      <input type="submit" value="Buy then Sell"><br>
    </form>
    <h4>Price is going to fall</h4>
    <form style="display:inline" action="/trade/sellThenBuy?next=%2Ftrade%2F${product}" method="post">
      <input type="hidden" name="product" value="${product}">
      Trade <input type="number" name="amountOfBase" value="${exchange.baseStep*10}"> ${baseCurrency}<br>
      Price will fall to <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 0.995)}" step="${exchange.quoteStep}"> ${quoteCurrency}<br>
      <input type="submit" value="Sell then Buy"><br>
    </form>

    <h3>Orders</h3>
    <iframe src="/orders/${product}" style="width: 100%; height: 160px;"></iframe>

    <h3>Depth</h3>
    <script src="/draw-candles.js"></script>
    <script>
      candles = (granularity) => {
        updateCandleChart(document.getElementById('candles'), '${product}', granularity);
      }
      updateCandleChart(document.getElementById('candles'), '${product}', 60);
    </script>
  `))
}
