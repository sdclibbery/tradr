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
  const toHex = function (x) { var hex = Number(x).toString(16); if (hex.length < 2) { hex = "0" + hex; } return hex; }

  const volumeBar = (x, volume) => {
    const height = canvas.height*0.5*volume/extents.maxVolume
    ctx.shadowBlur = 0
    ctx.fillStyle = volume >= extents.meanVolume ? '#808080a0' : '#b0b0b0a0'
    ctx.fillRect(x, canvas.height - height, barW, height)
  }

  const candleBar = (x, c) => {
    const volumeFraction = c.volume/extents.maxVolume
    const strength = toHex(128+Math.floor(127*volumeFraction))
    const opacity = toHex(Math.floor(255*Math.pow(volumeFraction, 0.6)))
    ctx.fillStyle = ((c.close >= c.open) ? `#00${strength}00` : `#${strength}0000`) + opacity
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = Math.floor(volumeFraction*3)
    ctx.fillRect(x+barW/2, Math.min(toY(c.low), toY(c.high)), 1, Math.abs(toY(c.low)-toY(c.high)))
    ctx.fillRect(x, Math.min(toY(c.open), toY(c.close)), barW, Math.max(Math.abs(toY(c.open)-toY(c.close)), 1))
  }

  candles.map((c, i) => {
    const x = toX(c.time*1000)-barW
    volumeBar(x, c.volume)
    candleBar(x, c)
  })
}
