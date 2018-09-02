const frame =  require('./frame').minimal
const tracker = require('../tracker');

exports.render = async (req, res, next) => {
  const balances = await tracker.getBalances()
  res.send(frame(`
    <h1>Account Balance History</h1>
    ${format(balances)}
  `))
}

const format = (balances) => {
  return JSON.stringify(balances)
}
