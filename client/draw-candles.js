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
  const meanVolume = extents.meanVolume

  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 0
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const volumeBar = (x, volume) => {
    const height = volume*600/granularity
    ctx.fillStyle = volume >= meanVolume ? '#808080' : '#b0b0b0'
    ctx.fillRect(x, canvas.height - height, barW, height)
  }

  const candleBar = (x, c) => {
    ctx.fillStyle = (c.close >= c.open) ? 'green' : 'red'
    ctx.fillRect(x+barW/2, Math.min(toY(c.low), toY(c.high)), 1, Math.abs(toY(c.low)-toY(c.high)))
    ctx.fillRect(x, Math.min(toY(c.open), toY(c.close)), barW, Math.max(Math.abs(toY(c.open)-toY(c.close)), 1))
  }

  background()

  candles.map((c, i) => {
    const x = toX(c.time*1000)-barW
    volumeBar(x, c.volume)
    candleBar(x, c)
  })

  drawLabels(canvas, extents)
}
