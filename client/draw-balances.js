drawBalances = (canvas, extents, transactions, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const manhattanLine = (t1, t2) => {
    ctx.shadowBlur = 0
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(toX(t1.time), toY(t1.balance))
    ctx.lineTo(toX(t2.time), toY(t1.balance))
    ctx.lineTo(toX(t2.time), toY(t2.balance))
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fillRect(toX(t2.time)-2, toY(t2.balance)-2, 5, 5)
  }

  transactions.map((t, i) => {
    if (i > 0) {
      manhattanLine(transactions[i-1], t)
    }
  })
}
