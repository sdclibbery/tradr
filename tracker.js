const db = require('sqlite')

db
.open(`${__dirname}/tradr.sqlite`, { Promise })
.then(() => db.migrate({ migrationsPath: __dirname+'/migrations'}))
.catch((err) => console.error(err.stack))

exports.trackBalances = async (balances) => {
  await Promise.all(
    balances.map(b => db.run(
      `INSERT INTO Balances (currency, exchange, at, balance, available, valueInEur, valueInBtc)
        VALUES ($currency, $exchange, $at, $balance, $available, $valueInEur, $valueInBtc);`, b
    )
  ))
}

exports.setBalanceValues = async (balance, valueInEur, valueInBtc) => {
  await db.run(
    `UPDATE Balances SET valueInEur=$valueInEur, valueInBtc=$valueInBtc WHERE currency=$currency AND exchange=$exchange AND at=$at;`,
    {
      $valueInEur:balance.valueInEur || valueInEur,
      $valueInBtc:balance.valueInBtc || valueInBtc,
      $currency:balance.currency,
      $exchange:balance.exchange,
      $at:balance.at
    }
  )
}

exports.getBalances = async () => {
  return await db.all(`SELECT currency, exchange, at, balance, available, valueInEur, valueInBtc FROM Balances
                        ORDER BY currency ASC, at DESC LIMIT 100000;`)
}

exports.trackTransfer = async (transfer) => {
  await db.run(
    `INSERT OR IGNORE INTO Transfers (exchange, id, currency, type, at, amount)
      VALUES ($exchange, $id, $currency, $type, $at, $amount);`, transfer
  )
}

exports.getTransfers = async () => {
  return await db.all(`SELECT * FROM Transfers;`)
}

exports.trackPrice = async (price) => {
  await db.run(
    `INSERT OR IGNORE INTO Prices (product, at, price, epochTimeStamp)
      VALUES ($product, $at, $price, $epochTimeStamp);`, price
  )
}
exports.getAllPrices = async () => {
  return await db.all(`SELECT * FROM Prices;`)
}
exports.setPriceEpochTimestamp = async (product, at, epochTimestamp) => {
  await db.run(`UPDATE Prices SET epochTimestamp=$epochTimestamp WHERE product=$product AND at=$at`, {$product:product, $at:at, $epochTimestamp:epochTimestamp})
}

exports.priceAt = async (product, epochTimeStamp) => {
  return await db.get(
    `SELECT * FROM Prices WHERE product = $product AND epochTimeStamp IN (
      SELECT MIN(epochTimeStamp) FROM 'Prices' WHERE epochTimeStamp >= $epochTimeStamp AND product = $product
      UNION SELECT MAX(epochTimeStamp) FROM 'Prices' WHERE epochTimeStamp <= $epochTimeStamp AND product = $product
    ) ORDER BY ABS($epochTimeStamp - epochTimeStamp) LIMIT 1;`,
    {$epochTimeStamp: epochTimeStamp, $product: product}
  )
}

exports.pricesOf = async (product) => {
  return await db.all(`SELECT * FROM Prices WHERE product=$product;`, {$product:product})
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
      .catch((e) => {
        console.error(e, `Error: Marking order ${id} as abandoned`)
        db.run(`UPDATE Orders SET status='abandoned', closeTime=strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id=$id`, {$id:id})
        .catch(console.error)
      })
    })
  })
  .catch(console.error)
}

exports.getOrders = async () => {
  return await db.all(`SELECT * FROM Orders;`)
}

exports.getOrdersForProduct = async (product) => {
  return await db.all(`SELECT * FROM Orders WHERE product = $product;`, {$product:product})
}

exports.getOpenOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'open' ORDER BY date(created) DESC;`)
}

exports.getFilledOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'filled' ORDER BY date(closeTime) DESC, date(created) DESC;`)
}

exports.getUserCancelledOrders = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status = 'cancelled' AND creator = 'user' ORDER BY date(created) DESC;`)
}

exports.getOrdersWithoutBotCancellations = async () => {
  return await db.all(`SELECT * FROM Orders WHERE status != 'cancelled' OR creator NOT LIKE '% bot' ORDER BY status DESC, date(created) DESC;`)
}
