const db = require('sqlite')

db
.open('./tradr.sqlite', { Promise })
.then(() => db.migrate({ migrationsPath: __dirname+'/migrations'}))
.catch((err) => console.error(err.stack))

exports.trackBalances = async (balances) => {
  balances.forEach(b => {
    await db.run(
      `INSERT INTO Balances (currency, exchange, at, amount) VALUES (currency, $exchange, at, amount);`, b
    )
  })
}
