const framework = require('./framework')
const tracker = require('../tracker')

framework.init([
  { name: 'product', alias: 'p', type: String, description: 'GDAX product' },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  logger.info(`BOT: Filling in historic prices for ${options.product}`)
  const conversions = {}
  const needsConversion = quoteCurrency !== 'USD'
  if (needsConversion) {
    require('fs')
    .readFileSync(`./data/${quoteCurrency.toLowerCase()}_usd_daily_historic.csv`, {encoding:'utf8'})
    .split(/\r?\n/)
    .forEach(l => {
      const time = l.split(',')[0].split(' ')[0].split('.')
      const date = new Date(`${time[2]}-${time[1]}-${time[0]}`)
      const price = l.split(',')[1]
      conversions[date] = price
    })
  }
  const targetCurrency = needsConversion ? 'usd' : quoteCurrency.toLowerCase()
  const lines = require('fs')
    .readFileSync(`./data/${baseCurrency.toLowerCase()}_${targetCurrency}_daily_historic.csv`, {encoding:'utf8'})
    .split(/\r?\n/)
  const cutoff = new Date('2017-01-01')
  for (i in lines) {
    const l = lines[i]
    const time = l.split(',')[0]
    const date = new Date(time)
    let price = l.split(',')[5]
    if (needsConversion) {
      price = price / conversions[date]
    }
    if (!!price && new Date(time) >= cutoff) {
      logger.debug(`BOT: TRACKING: product:${options.product}, at:${date.toUTCString()}, price:${price}  ORIGINAL USD ${l.split(',')[5]}`)
      await tracker.trackPrice({$product:options.product, $at:date.toUTCString(), $price:price})
    }
    if (!(i%100)) { logger.info(`BOT: progress: ${time}`) }
  }
  logger.info(`BOT: Finished filling in historic prices for ${options.product}`)
})
.then(framework.close)
.catch(framework.handleError)
