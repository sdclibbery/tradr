candleExtents = (canvas, candles, scale) => {
  let minPrice = candles.reduce((m, c) => Math.min(m, c.low==0 ? m : c.low), Infinity)
  let maxPrice = candles.reduce((m, c) => Math.max(m, c.high), -Infinity)
  if (scale == 'extend') {
    const range = maxPrice-minPrice
    maxPrice = maxPrice + range/2
    minPrice = minPrice - range/4
  }
  const minTime = 1000*candles[candles.length-1].time
  const maxTime = 1000*candles[0].time
  return {
    minPrice: minPrice,
    maxPrice: maxPrice,
    range: maxPrice-minPrice,
    minTime: minTime,
    maxTime: maxTime,
    toX: (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime),
    toY: (p) => canvas.height * (1 - (Math.log(p)-Math.log(minPrice))/(Math.log(maxPrice)-Math.log(minPrice))),
    maxVolume: candles.reduce((m, c) => Math.max(m, c.volume), 0),
    meanVolume: candles.reduce((m, c) => m+c.volume, 0) / candles.length,
    background: () => {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#f0f0f0'
      ctx.shadowBlur = 0
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    },
  }
}
