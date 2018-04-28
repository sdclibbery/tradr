const os =  require('os')
const frame =  require('./frame').apply

exports.render = (req, res) => {
  res.send(frame(`
    <h1>${os.hostname()} tradr </h1>
    <p><a href="status">GDAX status</a></p>
    <p><a href="orders">Orders</a></p>
    <p><a href="bot">Bots</a></p>
    <p><a href="system">System</a></p>
  `))
}
