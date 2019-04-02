const os =  require('os')
const frame =  require('./frame').apply

exports.render = (req, res) => {
  res.send(frame(`
    <h1>${os.hostname()} tradr </h1>
    <p>
      <a href="status">GDAX status</a>
      <a href="account/history">Accounts history</a>
    </p>
    <p>
      <a href="orders">All Orders</a>
      <a href="orders/open">Open Orders</a>
      <a href="orders/filled">Filled Orders</a>
      <a href="orders/cancelled">Cancelled Orders</a>
    </p>
    <p><a href="bot">Bots</a></p>
    <hr>
    <p>
      <a href='/trade/BTC-EUR'>BTC-EUR</a>
      <a href='/analyse/BTC-EUR'>Analyse BTC-EUR</a>
    </p>
    <hr>
    <p>
      <a href='/trade/BTC-GBP'>BTC-GBP</a>
      <a href='/analyse/BTC-GBP'>Analyse BTC-GBP</a>
    </p>
    <hr>
    <p>
      <a href='/trade/ETH-BTC'>ETH-BTC</a>
      <a href='/analyse/ETH-BTC'>Analyse ETH-BTC</a>
      <a href='/trade/ETH-EUR'>ETH-EUR</a>
    </p>
    <hr>
    <p>
      <a href='/trade/LTC-BTC'>LTC-BTC</a>
      <a href='/analyse/LTC-BTC'>Analyse LTC-BTC</a>
      <a href='/trade/LTC-EUR'>LTC-EUR</a>
    </p>
    <hr>
    <p><a href="system">System</a></p>
  `))
}
