updateCandleChart = (canvas, product, granularity) => {
  fetch(`https://api.gdax.com/products/${product}/candles?granularity=${granularity}`)
  .then(res => res.json())
  .then(cs => cs.map(candle => {
    return { time: candle[0], low: candle[1], high: candle[2], open: candle[3], close: candle[4], volume: candle[5] }
  }))
  .then(candles => {
    draw(canvas, candles, granularity)
  })
}

const draw = (canvas, candles, granularity) => {
  var ctx = canvas.getContext('2d')

  const minPrice = candles.reduce((m, c) => Math.min(m, c.low==0 ? m : c.low), Infinity)
  const maxPrice = candles.reduce((m, c) => Math.max(m, c.high), -Infinity)
  const minTime = candles[candles.length-1].time
  const maxTime = candles[0].time
  const barW = canvas.width/300
  const toX = (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime)
  const toY = (p) => canvas.height - (p-minPrice)*canvas.height/(maxPrice-minPrice)
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const volumeBar = (x, height) => {
    ctx.fillStyle = '#b0b0b0'
    ctx.fillRect(x, canvas.height - height, barW, height)
  }

  const candleBar = (x, c) => {
    ctx.fillStyle = (c.close >= c.open) ? 'green' : 'red'
    ctx.fillRect(x+barW/2, Math.min(toY(c.low), toY(c.high)), 1, Math.abs(toY(c.low)-toY(c.high)))
    ctx.fillRect(x, Math.min(toY(c.open), toY(c.close)), barW, Math.max(Math.abs(toY(c.open)-toY(c.close)), 1))
  }

  const division = (x1, y1, x2, y2) => {
    ctx.strokeStyle = '#00000040'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const timeLabel = (time, align) => {
    ctx.fillStyle = '#000000a0'
    ctx.font = '24px helvetica,arial bold'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = align
    const date = new Date(time*1000)
    const label = `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {hour12:false})}`
    ctx.fillText(label, toX(time), canvas.height)
    division(toX(time), 0, toX(time), canvas.height)
  }

  const priceLabel = (p) => {
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#00000080'
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
    division(0, toY(p), canvas.width, toY(p))
  }

  background()

  candles.map((c, i) => {
    const x = toX(c.time)-barW
    const volumeBarHeight = c.volume*300/granularity
    volumeBar(x, volumeBarHeight)
    candleBar(x, c)
  })

  timeLabel(maxTime, 'right')
  timeLabel((minTime+3*maxTime)/4, 'center')
  timeLabel((minTime+maxTime)/2, 'center')
  timeLabel((3*minTime+maxTime)/4, 'center')
  timeLabel(minTime, 'left')

  const range = maxPrice-minPrice
  const logRange = Math.floor(Math.log10(range))
  let interval = Math.pow(10, logRange)
  if (range/interval < 5) { interval /= 5 }
  const first = minPrice - minPrice%interval
  const quoteDp = Math.max(Math.floor(-Math.log10(maxPrice))+3, 0)
  for (let p = first; p < maxPrice; p += interval) {
    priceLabel(dp(p, quoteDp))
  }
}
