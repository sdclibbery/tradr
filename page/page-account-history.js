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
  return JSON.stringify(ignoreUnchanging(balances)).replace(/\}\,\{/gi, '},<br/>{')
}

const ignoreUnchanging = (balances) => {
  let lastBalance
  return balances.filter(b => {
    const changed = b.balance != lastBalance
    lastBalance = b.balance
    return changed
  })
}
