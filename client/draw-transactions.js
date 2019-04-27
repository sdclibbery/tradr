drawTransactions = (canvas, extents, transactions, color) => {
  const ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const blob = (t) => {
    ctx.fillStyle = color
    ctx.fillRect(toX(t.time), toY(t.balance), 5, 5)
  }

  transactions.map((t, i) => {
    blob(t)
  })
}
