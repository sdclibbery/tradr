drawBalances = (canvas, balances) => {
  balances = balances
    .map(b => { return {...b, time: Date.parse(b.at)}})
    .map(decorateWithTotals)
    .sort((a,b) => a.time-b.time)

  var ctx = canvas.getContext('2d')
  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 0
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  background()

  const minBalance = 0
  const maxBalance = balances.reduce((m, b) => Math.max(m, b.totalEur), -Infinity)
  const minTime = balances.reduce((m, b) => Math.min(m, b.time), Infinity)
  const maxTime = balances.reduce((m, b) => Math.max(m, b.time), -Infinity)
  const toX = (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime)
  const toY = (p) => canvas.height * (1 - ((p)-(minBalance))/((maxBalance)-(minBalance)))

  const colour = '#ff0000'
  ctx.fillStyle = colour
  ctx.strokeStyle = colour
  ctx.beginPath()
  balances.map(b => {
    ctx.lineTo(toX(b.time), toY(b.BTC.valueInEur))
    ctx.fillRect(toX(b.time), toY(b.BTC.valueInEur), 4,4)
  })
  ctx.stroke()
}

const decorateWithTotals = balance => {
  balance.totalEur = currencies(balance).map(b => b.valueInEur).filter(x=>x).map(parseFloat).reduce((a,b)=>a+b, 0)
  balance.totalBtc = currencies(balance).map(b => b.valueInBtc).filter(x=>x).map(parseFloat).reduce((a,b)=>a+b, 0)
  return balance
}

const currencies = ({time, at, ...rest}) => {
  return Object.values(rest)
}
