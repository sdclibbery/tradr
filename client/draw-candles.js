drawCandles = (canvas, candles) => {
  var ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const minPrice = candles.reduce((m, c) => Math.min(m, c.low==0 ? m : c.low), Infinity)
  const maxPrice = candles.reduce((m, c) => Math.max(m, c.high), -Infinity)
  const barW = canvas.width/300
  const toX = (i) => canvas.width-i*barW-2
  const toY = (p) => canvas.height - (p-minPrice)*canvas.height/(maxPrice-minPrice)

  candles.map((c, i) => {
    const x = toX(i)-barW

    ctx.fillStyle = '#b0b0b0'
    const volumeBarHeight = c.volume*5
    ctx.fillRect(x, canvas.height - volumeBarHeight, barW-1, volumeBarHeight)

    ctx.fillStyle = (c.close >= c.open) ? 'green' : 'red'
    ctx.fillRect(x+barW/2, Math.min(toY(c.low), toY(c.high)), 1, Math.abs(toY(c.low)-toY(c.high)))
    ctx.fillRect(x, Math.min(toY(c.open), toY(c.close)), barW, Math.max(Math.abs(toY(c.open)-toY(c.close)), 1))
  })

  ctx.fillStyle = 'black'
  ctx.font = '20px helvetica,arial bold'
  ctx.textAlign = 'right'
  ctx.fillText(candles[0].time, canvas.width, canvas.height)
  ctx.textAlign = 'left'
  ctx.fillText(candles[candles.length-1].time, 0, canvas.height)

  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = '#00000040'
  ctx.lineWidth = 0.5
  const range = maxPrice-minPrice
  const logRange = Math.floor(Math.log10(range))
  const interval = Math.pow(10, logRange)
  const first = minPrice + interval - minPrice%interval
  ctx.beginPath()
  for (let p = first; p < maxPrice; p += interval/2) {
    ctx.moveTo(0, toY(p))
    ctx.lineTo(canvas.width, toY(p))
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
  }
  ctx.stroke()
}
