const framework = require('./framework');

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR', description: 'GDAX product' },
  { name: 'amount', alias: 'a', type: Number, description: 'amount to bot with in base currency, eg in BTC for BTC-EUR' },
  { name: 'targetPrice', alias: 't', type: Number, description: 'price to buy at' },
])
.then(async ({ options, logger, exchange }) => {
  let orderId = null
  let currentPrice = await exchange.latestPrice()
  logger.warn(`BOT: sell-then-buy: trading ${exchange.formatBase(options.amount)} on ${options.product} from ${exchange.formatQuote(currentPrice)} with target price ${exchange.formatQuote(options.targetPrice)}`)
  while (true) {
    const sellPrice = currentPrice - exchange.quoteStep
    try {
      const {id} = await exchange.sell(options.amount, sellPrice, 'sellThenBuy bot', `trying to sell in to then buy at ${options.targetPrice}`)
      orderId = id
    } catch (e) {
      logger.error(`BOT: sell-then-buy: failed to place sell order; trying again...`)
      orderId = null
    }

    const {price} = await exchange.waitForPriceChange()
    currentPrice = price
    if (currentPrice <= options.targetPrice) {
      logger.error(`BOT: sell-then-buy: quitting because current price ${exchange.formatQuote(currentPrice)} fell below target price ${exchange.formatQuote(options.targetPrice)}`)
      break
    }

    if (orderId) {
      const {filled, price} = await exchange.orderStatus(orderId)
      if (filled) {
        logger.warn(`BOT: sell-then-buy: bought in at ${exchange.formatQuote(price)}`)
        const {id} = await exchange.buy(options.amount, options.targetPrice, 'sellThenBuy bot', `setting buy order after selling in at ${exchange.formatQuote(currentPrice)}`)
        logger.sync.warn(`BOT: sell-then-buy: set buy order for ${exchange.formatQuote(options.targetPrice)} : ${id}`)
        break
      } else {
        await exchange.cancelOrder(orderId)
        orderId = null
      }
    }
  }
})
.then(framework.close)
.catch(framework.handleError)
