const os =  require('os')
const frame =  require('./frame').apply

exports.render = (req, res) => {
  res.send(frame(`
    <h1>${os.hostname()} tradr </h1>
    <p><a href="status">GDAX status</a></p>
    <p><a href="orders">All Orders</a><a href="orders/open">Open Orders</a></p>
    <p><a href="bot">Bots</a></p>
    <hr>
    <p>
      <a href='/trade/BTC-EUR'>BTC-EUR</a>
      <a href='/trade/BTC-GBP'>BTC-GBP</a>
      <a href='/trade/BTC-USD'>BTC-USD</a>
    </p>
    <hr>
    <p>
      <a href='/trade/ETH-BTC'>ETH-BTC</a>
      <a href='/trade/ETH-EUR'>ETH-EUR</a>
    </p>
    <hr>
    <p>
      <a href='/trade/LTC-BTC'>LTC-BTC</a>
      <a href='/trade/LTC-EUR'>LTC-EUR</a>
    </p>
    <hr>
    <p>
      <a href='/trade/BCH-BTC'>BCH-BTC</a>
      <a href='/trade/BCH-EUR'>BCH-EUR</a>
    </p>
    <hr>
    <p><a href="system">System</a></p>
  `))
}
