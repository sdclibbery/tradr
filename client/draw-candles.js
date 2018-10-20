drawCandles = (canvas, candles, granularity, extents) => {
  const ctx = canvas.getContext('2d')

  const minPrice = extents.minPrice
  const maxPrice = extents.maxPrice
  const minTime = extents.minTime
  const maxTime = extents.maxTime
  const barW = canvas.width/300
  const toX = extents.toX
  const toY = extents.toY
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

  const volumeBar = (x, volume) => {
    const height = canvas.height*0.5*volume/extents.maxVolume
    ctx.fillStyle = volume >= extents.meanVolume ? '#808080' : '#b0b0b0'
    ctx.fillRect(x, canvas.height - height, barW, height)
  }

  const candleBar = (x, c) => {
    ctx.fillStyle = (c.close >= c.open) ? 'green' : 'red'
    ctx.fillRect(x+barW/2, Math.min(toY(c.low), toY(c.high)), 1, Math.abs(toY(c.low)-toY(c.high)))
    ctx.fillRect(x, Math.min(toY(c.open), toY(c.close)), barW, Math.max(Math.abs(toY(c.open)-toY(c.close)), 1))
  }

  candles.map((c, i) => {
    const x = toX(c.time*1000)-barW
    volumeBar(x, c.volume)
    candleBar(x, c)
  })
}
