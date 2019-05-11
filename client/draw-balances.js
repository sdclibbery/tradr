drawBalances = (canvas, extents, transactions, getValue, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const manhattanLine = (t1, t2) => {
    ctx.shadowBlur = 0
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(toX(t1.time), toY(getValue(t1)))
    ctx.lineTo(toX(t1.time), toY(getValue(t2)))
    ctx.lineTo(toX(t2.time), toY(getValue(t2)))
    ctx.stroke()
  }

  transactions.map((t, i) => {
    if (i > 0) {
      manhattanLine(transactions[i-1], t)
    }
  })
}

drawPrices = (canvas, extents, data, getValue, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const line = (t1, t2) => {
    ctx.shadowBlur = 0
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(toX(t1.time), toY(getValue(t1)))
    ctx.lineTo(toX(t2.time), toY(getValue(t2)))
    ctx.stroke()
  }

  data.map((t, i) => {
    if (i > 0) {
      line(data[i-1], t)
    }
  })
}

drawOrders = (canvas, extents, orders, colours) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  orders.map(({product, created, filled}) => {
    const baseCurrency = product.split('-')[0]
    const quoteCurrency = product.split('-')[1]
    ctx.fillStyle = colours[baseCurrency] + '10'
    ctx.fillRect(toX(created), 0, toX(filled)-toX(created), canvas.height)
  })
}
