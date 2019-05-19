drawBalanceLine = (canvas, extents, transactions, getValue, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  ctx.shadowBlur = 0
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(toX(extents.minTime), toY(getValue(extents.minTime)))
  transactions.map(t => {
    ctx.lineTo(toX(t.time), toY(getValue(t)))
  })
  ctx.stroke()
}

drawOrders = (canvas, extents, orders, colours) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  orders.forEach(({product, created, filled}) => {
    const baseCurrency = product.split('-')[0]
    const quoteCurrency = product.split('-')[1]
    ctx.fillStyle = colours[baseCurrency] + '10'
    ctx.fillRect(toX(created), 0, toX(filled)-toX(created), canvas.height)
  })
}
