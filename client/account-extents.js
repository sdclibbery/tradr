accountExtents = (canvas, transactions, getValue) => {
  let minAmount = transactions.reduce((m, c) => Math.min(m, getValue(c)), Infinity)
  let maxAmount = transactions.reduce((m, c) => Math.max(m, getValue(c)), -Infinity)
  const minTime = transactions[transactions.length-1].time
  const maxTime = transactions[0].time
  return {
    minPrice: minAmount,
    maxPrice: maxAmount,
    range: maxAmount-minAmount,
    minTime: minTime,
    maxTime: maxTime,
    toX: (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime),
    toY: (a) => canvas.height*(maxAmount-a)/(maxAmount-minAmount),
    background: () => {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#f0f0f0'
      ctx.shadowBlur = 0
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    },
  }
}
