const framework = require('./framework')

const { options, logger, exchange } = framework.initBot([])

framework.runBot(async () => {
  const orders = await exchange.orders()
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)
  let orderInfo = ''
  orders.map(o => {
    const baseCurrency = o.product.split('-')[0]
    const quoteCurrency = o.product.split('-')[1]
    orderInfo += `\n${o.product}: price ${dp2(o.price)} ${quoteCurrency}; amount: ${dp2(o.amount)} ${baseCurrency}; ${o.side} ${o.type} created ${o.created}`
  })
  logger.sync.info(`BOT: Open orders: ${orderInfo}`)
}, logger)
