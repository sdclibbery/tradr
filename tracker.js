const db = require('sqlite')

db
.open(`${__dirname}/tradr.sqlite`, { Promise })
.then(() => db.migrate({ migrationsPath: __dirname+'/migrations'}))
.catch((err) => console.error(err.stack))

exports.trackBalances = async (balances) => {
  await Promise.all(
    balances.map(b => db.run(
      `INSERT INTO Balances (currency, exchange, at, balance, available) VALUES ($currency, $exchange, $at, $balance, $available);`, b
    )
  ))
}

exports.trackOrder = async (order) => {
  await db.run(
    `INSERT INTO Orders (id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason)
      VALUES ($id, $exchange, $product, $status, $created, $side, $orderPrice, $priceAtCreation, $amount, $creator, $reason);`,
    order
  )
}

exports.trackOrderCancellation = async (id) => {
  await db.run(
    `UPDATE Orders SET status='cancelled' WHERE id=$id;`,
    {$id:id}
  )
}

exports.getOrders = async () => {
  return await db.all(`SELECT * FROM Orders;`)
}

exports.getOrdersWithoutBotCancellations = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status != 'cancelled' OR creator NOT LIKE 'bot-%';`)
}
