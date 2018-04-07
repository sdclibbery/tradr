exports.ema = (count) => {
  let previous
  const primeTheEmaForTheFirstRun = (candles) => {
    const numOfPrimePumps = Math.max(candles.length - count, 0)
    previous = simpleMovingAverage(candles.slice(numOfPrimePumps), count)
    for (i = numOfPrimePumps; i > 0; i--) {
      previous = exponentialMovingAverage(candles.slice(i), count, previous)
    }
  }
  const update = (candles) => {
    if (previous === undefined) { primeTheEmaForTheFirstRun(candles) }
    const ema = exponentialMovingAverage(candles, count, previous)
    previous = ema
    return ema
  }
  return update
}

const simpleMovingAverage = (candles, count) => candles.slice(0, count).reduce((acc, c) => acc+c.close, 0) / count
const exponentialMovingAverage = (candles, count, previous) => {
  const multiplier = (2 / (count + 1))
  return (candles[0].close - previous) * multiplier + previous
}
