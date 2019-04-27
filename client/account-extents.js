accountExtents = (canvas, transactions) => {
  let minAmount = 0
  let maxAmount = transactions.reduce((m, c) => Math.max(m, c.balance), -Infinity)
  const minTime = transactions[0].time
  const maxTime = transactions[transactions.length-1].time
console.log(`${minAmount}  ${maxAmount}  ${minTime}  ${maxTime}`)
  return {
    minPrice: minAmount,
    maxPrice: maxAmount,
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
