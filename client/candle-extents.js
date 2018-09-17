candleExtents = (canvas, candles) => {
  const minPrice = candles.reduce((m, c) => Math.min(m, c.low==0 ? m : c.low), Infinity)
  const maxPrice = candles.reduce((m, c) => Math.max(m, c.high), -Infinity)
  const minTime = 1000*candles[candles.length-1].time
  const maxTime = 1000*candles[0].time
  return {
    minPrice: minPrice,
    maxPrice: maxPrice,
    minTime: minTime,
    maxTime: maxTime,
    toX: (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime),
    toY: (p) => canvas.height * (1 - (Math.log(p)-Math.log(minPrice))/(Math.log(maxPrice)-Math.log(minPrice))),
    maxVolume: candles.reduce((m, c) => Math.max(m, c.volume), 0),
    meanVolume: candles.reduce((m, c) => m+c.volume, 0) / candles.length,
  }
}
