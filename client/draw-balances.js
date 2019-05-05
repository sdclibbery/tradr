drawBalances = (canvas, extents, transactions, getValue, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const manhattanLine = (t1, t2) => {
    ctx.shadowBlur = 0
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(toX(t1.time), toY(getValue(t1)))
    ctx.lineTo(toX(t1.time), toY(getValue(t2)))
    ctx.lineTo(toX(t2.time), toY(getValue(t2)))
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fillRect(toX(t2.time)-2, toY(getValue(t2))-2, 5, 5)
  }

  transactions.map((t, i) => {
    if (i > 0) {
      manhattanLine(transactions[i-1], t)
    }
  })
}
