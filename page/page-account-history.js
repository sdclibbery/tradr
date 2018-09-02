const frame =  require('./frame').minimal
const GdaxExchange = require('../gdax-exchange');

exports.render = async (req, res, next) => {
  res.send(frame(`
    <h1>Account Balance History</h1>
  `))
}
