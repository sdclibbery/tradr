const framework = require('./framework')

const { options, logger, exchange } = framework.initBot([])

framework.runBot(async () => {
  const orders = await exchange.orders()
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)
  const dp4 = (x) => Number.parseFloat(x).toFixed(4)
  let orderInfo = ''
  orders.map(o => {
    const baseCurrency = o.product.split('-')[0]
    const quoteCurrency = o.product.split('-')[1]
    const stopReport = o.stop ? `stop ${o.stop} at ${dp2(o.stopPrice)} ${quoteCurrency}: ` : ''
    orderInfo += `\n${stopReport}${o.type} ${o.side} ${dp4(o.amount)} ${baseCurrency} at ${dp2(o.price)} ${quoteCurrency}; created at ${o.created}`
  })
  logger.sync.info(`BOT: Open orders: ${orderInfo}`)
}, logger)
