exports.fetcher = (product, authedClient, log, catchApiError, handleError) => {
  return async ({startTime, count, granularity}) => {
    granularity = granularity || 60
    count = count || 300
    start = startTime || new Date(Date.now() - count*granularity*1000)
    end = new Date(start.getTime() + count*granularity*1000)
    return authedClient.getProductHistoricRates(product, { start: start.toISOString(), end: end.toISOString(), granularity: granularity })
//        .then(log(`CoinbasePro: getProductHistoricRates`))
      .then(catchApiError)
      .then(cs => fillInCandleGaps(cs, granularity))
      .then(cs => cs.map(candle => {
        return { time: candleTimeToDate(candle[0]), low: candle[1], high: candle[2], open: candle[3], close: candle[4], volume: candle[5] }
      }))
      .catch(handleError('candles ${granularity}'))
  }
}

const fillInCandleGaps = (cs, granularity) => {
  const filledIn = []
  const lastCandle = () => filledIn[filledIn.length-1]
  const round = x => x - x%granularity
  const nextCandleTime = () => (lastCandle() ? lastCandle()[0] : round(start.getTime()/1000)) + granularity
  const lastClose = (c) => lastCandle() ? lastCandle()[4] : c[3]
  const extraCandle = (c) => [nextCandleTime(), lastClose(c), lastClose(c), lastClose(c), lastClose(c), 0]
  cs.reverse().forEach(c => {
    while (c[0] > nextCandleTime()) {
      filledIn.push(extraCandle(c))
    }
    filledIn.push(c)
  })
  while (end.getTime()/1000 > nextCandleTime()) {
    filledIn.push(extraCandle())
  }
  return filledIn.reverse()
}

const candleTimeToDate = epochSeconds => {
  const d = new Date()
  d.setTime(epochSeconds*1000)
  return d
}
