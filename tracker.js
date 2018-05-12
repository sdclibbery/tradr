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
    `UPDATE Orders SET status='cancelled', closeTime=strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id=$id;`,
    {$id:id}
  )
}

exports.updateLiveOrders = (liveOrderIds, getOrderStatus) => {
  const liveOrderList = liveOrderIds.map(id => `'${id}'`).join(', ')
  db.all(`SELECT id, amount FROM Orders WHERE id NOT IN (${liveOrderList}) AND status = 'open';`)
  .then(ordersToCheck => {
    ordersToCheck.forEach(({id, amount}) => {
      getOrderStatus(id)
      .then(({filled, filledAmountInQuoteCurrency, price}) => {
        if (filled) {
          const fees = filledAmountInQuoteCurrency - amount*price
          db.run(`UPDATE Orders SET status='filled', fillPrice=$price, fees=$fees, closeTime=strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id=$id`, {$id:id, $price:price, $fees:fees})
          .catch(console.error)
        }
      })
      .catch(console.error)
    })
  })
  .catch(console.error)
}

exports.getOrders = async () => {
  return await db.all(`SELECT * FROM Orders;`)
}

exports.getOpenOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'open' ORDER BY date(created) DESC;`)
}

exports.getFilledOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'filled' ORDER BY date(created) DESC;`)
}

exports.getUserCancelledOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'cancelled' AND creator = 'user' ORDER BY date(created) DESC;`)
}

exports.getOrdersWithoutBotCancellations = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status != 'cancelled' OR creator NOT LIKE '% bot' ORDER BY status DESC, date(created) DESC;`)
}
