const db = require('sqlite')

db.open('./tradr.sqlite', { Promise })
  .then(() => db.migrate({ migrationsPath: __dirname+'/migrations'}))
  .catch((err) => console.error(err.stack))

exports.trackOrder = async (order) => {
console.log('tracking order ', JSON.stringify(order))
  await db.run(
    `INSERT INTO Orders (id, exchange, product, status, created, side, orderPrice, priceAtCreation, amount, creator, reason)
      VALUES ($id, $exchange, $product, $status, $created, $side, $orderPrice, $priceAtCreation, $amount, $creator, $reason);`,
    order
  )
}

exports.getOrders = async () => {
  return await db.all(`SELECT * FROM Orders;`)
}
