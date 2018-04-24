const frame =  require('./frame').apply
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  const product = req.params.product
  const baseCurrency = product.split('-')[0]
  const quoteCurrency = product.split('-')[1]
  const exchange = GdaxExchange.createExchange({product: product}, { debug: () => {}, error: console.log, })
  const price = await exchange.latestPrice()
  const candles = await exchange.candles({})

  res.send(frame(`
    <h1>Trade ${product}</h1>

    <h3>Price/Candles</h3>
    <div style="overflow-x:auto; direction:rtl; width:100%; padding:0;">
      <canvas id="candles" width="1800" height="500" style="width:1400px; height:500px; margin:0;"></canvas>
    </div>
    <p><span id="price">${price}</span> ${quoteCurrency}</p>

    <h3>Account</h3>
    <iframe src="/account/${product}" style="width: 100%; height: 80px;"></iframe>

    <h3>Trade</h3>
    <h4>Price fluctuating without major trend</h4>
    <form style="display:inline" action="/trade/limit/buysell?next=%2Ftrade%2F${product}&reason=buy+and+sell+above+and+below+current+price" method="post">
      <input type="hidden" name="product" value="${product}">
      <input type="number" name="amountOfBase" value="${exchange.baseStep*10}" step="${exchange.baseStep}">
      <input type="number" name="buyPrice" value="${exchange.roundQuote(price * 0.995)}" step="${exchange.quoteStep}">
      <input type="number" name="sellPrice" value="${exchange.roundQuote(price * 1.005)}" step="${exchange.quoteStep}">
      <input type="submit" value="Place orders">
    </form>
    <h4>Price is going to rise</h4>
    <form style="display:inline" action="/trade/buyThenSell?next=%2Ftrade%2F${product}" method="post">
      <input type="hidden" name="product" value="${product}">
      <input type="text" name="amountOfBase" value="0.01">
      <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 1.005)}" step="${exchange.quoteStep}">
      <input type="submit" value="Buy then Sell">
    </form>
    <h4>Price is going to fall</h4>
    <form style="display:inline" action="/trade/sellThenBuy?next=%2Ftrade%2F${product}" method="post">
      <input type="hidden" name="product" value="${product}">
      <input type="text" name="amountOfBase" value="0.01">
      <input type="number" name="targetPrice" value="${exchange.roundQuote(price * 0.995)}" step="${exchange.quoteStep}">
      <input type="submit" value="Sell then Buy">
    </form>

    <h3>Orders</h3>
    <iframe src="/orders/${product}" style="width: 100%; height: 160px;"></iframe>

    <h3>Depth</h3>
    <script src="/draw-candles.js"></script>
    <script>
      var candles = ${JSON.stringify(candles)};
      drawCandles(document.getElementById('candles'), candles);
    </script>
  `))
}
