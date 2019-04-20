drawBalances = (canvas, currency, balances, transfers, colours) => {
  balances = balances
    .map(b => { return {...b, time: Date.parse(b.at)}})
    .map(decorateWithTotals)
    .sort((a,b) => a.time-b.time)
  transfers = transfers
    .map(t => { return {...t, time: Date.parse(t.at)}})
console.log(JSON.stringify(transfers, null, 2))

  var ctx = canvas.getContext('2d')
  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 0
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  background()

  const minBalance = 0
  const maxBalance = balances.reduce((m, b) => Math.max(m, b['total'+currency]||0), -Infinity)
  const minTime = balances.reduce((m, b) => Math.min(m, b.time), Infinity)
  const maxTime = balances.reduce((m, b) => Math.max(m, b.time), -Infinity)
  const toX = (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime)
  const toY = (p) => canvas.height * (1 - ((p)-(minBalance))/((maxBalance)-(minBalance)))

  const line = (colour, t1, b1, t2, b2) => {
    const toBalanceValue = b => (b && (b['valueIn'+currency] || b['total'+currency])) || (b && !isNaN(b) && b) || 0
    const v1 = toBalanceValue(b1)
    const v2 = toBalanceValue(b2)
    ctx.fillStyle = colour
    ctx.strokeStyle = colour
    ctx.beginPath()
    ctx.lineTo(toX(t1), toY(v1))
    ctx.lineTo(toX(t2), toY(v2))
    ctx.stroke()
    ctx.fillRect(toX(t2)-1, toY(v2)-1, 3, 3)
  }

  balances.forEach((b,i) => {
    const b2 = balances[i-1]
    if (!b2) { return }
    line(colours.EUR, b.time, b.EUR, b2.time, b2.EUR)
    line(colours.LTC, b.time, b.LTC, b2.time, b2.LTC)
    line(colours.ETH, b.time, b.ETH, b2.time, b2.ETH)
    line(colours.BTC, b.time, b.BTC, b2.time, b2.BTC)
    line(colours.TOTAL, b.time, b, b2.time, b2)
  })

  transfers.forEach(t => {
    line(colours[t.currency.toUpperCase()], t.time, minBalance, t.time, maxBalance)
  })

  drawLabels(canvas, {
    minPrice:minBalance,
    maxPrice:maxBalance,
    minTime:minTime,
    maxTime:maxTime,
    toX:toX,
    toY:toY,
  })
}

const decorateWithTotals = balance => {
  balance.totalEur = currencies(balance).map(b => b.valueInEur).filter(x=>x).map(parseFloat).reduce((a,b)=>a+b, 0)
  balance.totalBtc = currencies(balance).map(b => b.valueInBtc).filter(x=>x).map(parseFloat).reduce((a,b)=>a+b, 0)
  return balance
}

const currencies = ({time, at, ...rest}) => {
  return Object.values(rest)
}
