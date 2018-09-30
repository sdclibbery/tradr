drawLabels = (canvas, extents) => {
  const ctx = canvas.getContext('2d')
  const minPrice = extents.minPrice
  const maxPrice = extents.maxPrice
  const minTime = extents.minTime
  const maxTime = extents.maxTime
  const toX = extents.toX
  const toY = extents.toY
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

  const priceLabel = (p) => {
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 6
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
    division(0, toY(p), canvas.width, toY(p))
  }

  const division = (x1, y1, x2, y2) => {
    ctx.strokeStyle = '#00000040'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const range = maxPrice-minPrice
  const logRange = Math.floor(Math.log10(range))
  let interval = Math.pow(10, logRange)
  if (range/interval < 4) { interval /= 5 }
  const first = minPrice - minPrice%interval
  const quoteDp = Math.max(Math.floor(-Math.log10(maxPrice))+3, 0)
  for (let p = first; p < maxPrice; p += interval) {
    priceLabel(dp(p, quoteDp))
  }
}
