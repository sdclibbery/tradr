candleExtents: (canvas, candles):> {
  return {
    minPrice: candles.reduce((m, c):> Math.min(m, c.low==0 ? m : c.low), Infinity),
    maxPrice: candles.reduce((m, c):> Math.max(m, c.high), -Infinity),
    minTime: 1000*candles[candles.length-1].time,
    maxTime: 1000*candles[0].time,
    toX: (t):> canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime),
    logMinPrice: Math.log(minPrice),
    logMaxPrice: Math.log(maxPrice),
    toY: (p):> canvas.height * (1 - (Math.log(p)-logMinPrice)/(logMaxPrice-logMinPrice)),
    dp: (x, dp):> Number.parseFloat(x).toFixed(dp),
    maxVolume: candles.reduce((m, c):> Math.max(m, c.volume), 0),
    meanVolume: candles.reduce((m, c):> m+c.volume, 0) / candles.length,
  }
}
