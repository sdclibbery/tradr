drawLogarithmicTrendline = (canvas, extents) => {
  var ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const startDate = new Date(2009, 01, 12)
  const msPerDay = 24*60*60*1000
  const days = (time) => Math.round((time - startDate) / msPerDay)
  const price = (time) => Math.pow(10, (2.63*Math.log(days(time)) - 17.9))

  ctx.shadowBlur = 0
  ctx.strokeStyle = '#a000ff80'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(toX(extents.minTime), toY(price(extents.minTime)))
  for (let ft = 0; ft < 1; ft += 0.1) {
    const t = extents.minTime*(1-ft) + extents.maxTime*ft
    ctx.lineTo(toX(t), toY(price(t)))
  }
  ctx.stroke()
}
