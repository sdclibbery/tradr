const os =  require('os')
const frame =  require('./frame').apply

exports.render = (req, res) => {
  res.send(frame(`
    <h1>${os.hostname()} tradr </h1>
    <p>
      <a href="status">CoinbasePro status</a>
    </p>
    <p>
      <a href="trendline">BTC Trendline</a>
    </p>
    <p>
      <a href="account/history">Accounts history</a>
    </p>
    <p>
      <a href="orders/open">Open Orders</a>
      <a href="orders/filled">Filled Orders</a>
    </p>
    <p>
      <a href="orders">All Orders</a>
      <a href="orders/cancelled">Cancelled Orders</a>
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
    </p>
    <hr>
    <p>
      <a href='/trade/LTC-BTC'>LTC-BTC</a>
      <a href='/analyse/LTC-BTC'>Analyse LTC-BTC</a>
    </p>
    <hr>
    <p><a href="bot">Bots</a></p>
    <hr>
    <p><a href="system">System</a></p>
  `))
}
