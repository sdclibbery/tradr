drawBalances = (canvas, balances) => {
  balances = balances.map(b => { return {...b, time: Date.parse(b.at)}})

  var ctx = canvas.getContext('2d')
  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 0
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  background()

  const getBalancesForCurrency = cur => balances.filter(b => b.currency == cur).sort((a,b) => a.time-b.time)

  drawBalance(canvas, ctx, getBalancesForCurrency('EUR'), '#ff0000')
  drawBalance(canvas, ctx, getBalancesForCurrency('BTC'), '#00ff00')
  drawBalance(canvas, ctx, getBalancesForCurrency('ETH'), '#0000ff')
  drawBalance(canvas, ctx, getBalancesForCurrency('LTC'), '#ff00ff')
}

const drawBalance = (canvas, ctx, balances, colour) => {
  const minBalance = balances.reduce((m, c) => Math.min(m, c.valueInEur), Infinity)
  const maxBalance = balances.reduce((m, c) => Math.max(m, c.valueInEur), -Infinity)
  const minTime = balances.reduce((m, c) => Math.min(m, c.time), Infinity)
  const maxTime = balances.reduce((m, c) => Math.max(m, c.time), -Infinity)
  const toX = (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime)
  const toY = (p) => canvas.height * (1 - ((p)-(minBalance))/((maxBalance)-(minBalance)))

  ctx.fillStyle = colour
  ctx.strokeStyle = colour
  ctx.beginPath()
  balances.map(b => {
    ctx.lineTo(toX(b.time), toY(b.valueInEur))
    ctx.fillRect(toX(b.time), toY(b.valueInEur), 4,4)
  })
  ctx.stroke()
}
