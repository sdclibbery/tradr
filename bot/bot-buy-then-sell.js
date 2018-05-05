const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in base currency, eg in BTC for BTC-EUR' },
  { name: 'targetPrice', alias: 't', type: Number, description: 'price to sell at' },
])
.then(async ({ options, logger, exchange }) => {
  let orderId = null
  let currentPrice = await exchange.latestPrice()
  logger.warn(`BOT: buy-then-sell: trading ${exchange.formatBase(options.amount)} on ${options.product} from ${exchange.formatQuote(currentPrice)} with target price ${exchange.formatQuote(options.targetPrice)}`)
  while (true) {
    const buyPrice = currentPrice - exchange.quoteStep
    try {
      const {id} = await exchange.buy(options.amount, buyPrice, 'buyThenSell bot', `trying to buy in to then sell at ${options.targetPrice}`)
      orderId = id
    } catch (e) {
      logger.error(`BOT: buy-then-sell: failed to place buy order; trying again...`)
      orderId = null
    }

    const {price} = await exchange.waitForPriceChange()
    currentPrice = price
    if (currentPrice >= options.targetPrice) {
      logger.error(`BOT: buy-then-sell: quitting because current price ${exchange.formatQuote(currentPrice)} rose above target price ${exchange.formatQuote(options.targetPrice)}`)
      break
    }

    if (orderId) {
      const {filled, price} = await exchange.orderStatus(orderId)
      if (filled) {
        logger.warn(`BOT: buy-then-sell: bought in at ${exchange.formatQuote(price)}`)
        const {id} = await exchange.sell(options.amount, options.targetPrice, 'buyThenSell bot', `setting sell order after buying in at ${exchange.formatQuote(currentPrice)}`)
        logger.sync.warn(`BOT: buy-then-sell: set sell order for ${exchange.formatQuote(options.targetPrice)} : ${id}`)
        break
      } else {
        await exchange.cancelOrder(orderId)
        orderId = null
      }
    }
  }
})
.catch(e => console.error(`bot ${__filename} launch error: `, e))
