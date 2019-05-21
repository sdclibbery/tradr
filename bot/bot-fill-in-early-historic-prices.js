const framework = require('./framework')
const tracker = require('../tracker')

framework.init([
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-GBP', description: 'coinbasepro product' },
])
.then(async ({ options, logger, exchange }) => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  logger.info(`BOT: Filling in historic prices for ${options.product}`)
  const conversions = {}
  const needsConversion = quoteCurrency !== 'USD'
  if (needsConversion) {
    require('fs')
    .readFileSync(`../data/${quoteCurrency.toLowerCase()}_usd_daily_historic.csv`, {encoding:'utf8'})
    .split(/\r?\n/)
    .forEach(l => {
      if (quoteCurrency !== 'BTC') {
        const time = l.split(',')[0].split(' ')[0].split('.')
        const date = new Date(`${time[2]}-${time[1]}-${time[0]}`)
        const price = l.split(',')[1]
        conversions[date] = price
      } else {
        const time = l.split(',')[0]
        const date = new Date(time)
        let price = l.split(',')[5]
        conversions[date] = price
      }
    })
  }
  const targetCurrency = needsConversion ? 'usd' : quoteCurrency.toLowerCase()
  const prices = JSON.parse(
    require('fs').readFileSync(`../data/${baseCurrency.toLowerCase()}_${targetCurrency}_daily_historic_early.csv`, {encoding:'utf8'})
  )
  const cutoff = new Date('2010-08-01')
  let i=0
  for (i in prices) {
    const p = prices[i]
    const date = new Date(Date.parse(p.Date))
    let price = p.Price
    if (needsConversion) {
      price = price / conversions[date]
    }
    if (!!price && date >= cutoff) {
      logger.debug(`BOT: TRACKING: product:${options.product}, at:${date.toUTCString()}, price:${price}  ORIGINAL USD ${p.Price}`)
      await tracker.trackPrice({$product:options.product, $at:(date.toUTCString()), $price:price, $epochTimeStamp:(date.getTime())})
    }
    if (!(i%100)) { logger.info(`BOT: progress: ${p.Date}`) }
    i++
  }
  logger.info(`BOT: Finished filling in historic prices for ${options.product}`)
})
.then(framework.close)
.catch(framework.handleError)
