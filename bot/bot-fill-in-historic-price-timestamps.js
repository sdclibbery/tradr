const framework = require('./framework')
const tracker = require('../tracker')

framework.init([])
.then(async ({ options, logger, exchange }) => {
  logger.info(`BOT: Filling in price timestamps`)
  let ctr = 0
  let updated = 0
  const prices = await tracker.getAllPrices()
  for (idx in prices) {
    const {product, at, epochTimestamp} = prices[idx]
    if (!epochTimestamp) {
      await tracker.setPriceEpochTimestamp(product, at, Date.parse(at))
      updated++
    }
    ctr++
    if (ctr % 100 == 0) { logger.info(`BOT: Progress: ${product} ${at} ; updated ${updated}`) }
  }
  logger.info(`BOT: Finished filling in price timestamps`)
})
.then(framework.close)
.catch(framework.handleError)
