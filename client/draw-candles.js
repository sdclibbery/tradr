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

  const timeLabel = (time, align) => {
    ctx.fillStyle = '#000000a0'
    ctx.font = '24px helvetica,arial bold'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = align
    const date = new Date(time*1000)
    const label = `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {hour12:false})}`
    ctx.fillText(label, toX(time), canvas.height)
  }

  const priceLabel = (p) => {
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#00000040'
    ctx.fillStyle = '#00000080'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, toY(p))
    ctx.lineTo(canvas.width, toY(p))
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
  }

  background()

  candles.map((c, i) => {
    const x = toX(c.time)-barW
    const volumeBarHeight = c.volume*300/granularity
    volumeBar(x, volumeBarHeight)
    candleBar(x, c)
  })

  timeLabel(candles[0].time, 'right')
  timeLabel(candles[candles.length-1].time, 'left')

  const range = maxPrice-minPrice
  const logRange = Math.floor(Math.log10(range))
  const interval = Math.pow(10, logRange)
  const first = minPrice - minPrice%interval
  for (let p = first; p < maxPrice; p += interval) {
    priceLabel(p, )
  }
}
