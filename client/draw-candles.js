drawCandles = (canvas, candles, granularity) => {
  var ctx = canvas.getContext('2d')

  const minPrice = candles.reduce((m, c) => Math.min(m, c.low==0 ? m : c.low), Infinity)
  const maxPrice = candles.reduce((m, c) => Math.max(m, c.high), -Infinity)
  const minTime = 1000*candles[candles.length-1].time
  const maxTime = 1000*candles[0].time
  const barW = canvas.width/300
  const toX = (t) => canvas.width - canvas.width*(maxTime-t)/(maxTime-minTime)
  const logMinPrice = Math.log(minPrice)
  const logMaxPrice = Math.log(maxPrice)
  const toY = (p) => canvas.height * (1 - (Math.log(p)-logMinPrice)/(logMaxPrice-logMinPrice))
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const maxVolume = candles.reduce((m, c) => Math.max(m, c.volume), 0)
  const meanVolume = candles.reduce((m, c) => m+c.volume, 0) / candles.length

  const background = () => {
    ctx.fillStyle = '#f0f0f0'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 0
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const volumeBar = (x, volume) => {
    const height = volume*600/granularity
    ctx.fillStyle = volume >= meanVolume ? '#808080' : '#b0b0b0'
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

  const timeLabel = (time, label, align) => {
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 6
    ctx.font = '26px helvetica,arial bold'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = align
    ctx.fillText(label, toX(time), canvas.height)
    division(toX(time), 0, toX(time), canvas.height)
  }

  const priceLabel = (p) => {
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 6
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
    division(0, toY(p), canvas.width, toY(p))
  }

  background()

  candles.map((c, i) => {
    const x = toX(c.time*1000)-barW
    volumeBar(x, c.volume)
    candleBar(x, c)
  })

  const timeRange = maxTime - minTime
  const days = Math.floor(timeRange/1000/60/60/24)
  const weeks = Math.floor(days/7)
  const minDate = new Date(minTime)
  const maxDate = new Date(maxTime)

  const thisYear = new Date().getFullYear()
  for (let y = thisYear; y > thisYear-5; y--) {
    const t = (new Date(0).setFullYear(y))
    timeLabel(t, y.toFixed(0), 'center')
  }

  const months = ['', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const thisMonth = new Date().getMonth()
  for (let m = thisMonth; m > thisMonth-12; m--) {
    const d = new Date(0)
    d.setYear(thisYear)
    const t = d.setMonth(m)
    timeLabel(t, months[(m+12)%12], 'center')
  }

  const aDay = 24*60*60*1000
  const aWeek = 7*aDay

  if (timeRange <= 13*aWeek) {
    const thisDate = new Date().getDate()
    const daysInterval = timeRange<2*aWeek ? 1 : 7
    for (let days = thisDate; days > thisDate-93; days -= daysInterval) {
      const d = new Date()
      d.setSeconds(0)
      d.setMinutes(0)
      d.setHours(0)
      const t = d.setDate(days)
      timeLabel(t, ((days+24)%24)+'/'+(d.getMonth()+1), 'center')
    }
  }

  if (timeRange <= 4*aDay) {
    const thisHour = new Date().getHours()
    const hoursInterval = timeRange<aDay*0.75 ? 1 : timeRange<2*aDay ? 3 : 6
    for (let h = thisHour; h > thisHour-96; h -= hoursInterval) {
      const hour = ((h+24)%24)
      if (hour == 0) { continue }
      const d = new Date()
      d.setMinutes(0)
      d.setSeconds(0)
      const t = d.setHours(h)
      timeLabel(t, hour+':00', 'center')
    }
  }

  const range = maxPrice-minPrice
  const logRange = Math.floor(Math.log10(range))
  let interval = Math.pow(10, logRange)
  if (range/interval < 4) { interval /= 5 }
  const first = minPrice - minPrice%interval
  const quoteDp = Math.max(Math.floor(-Math.log10(maxPrice))+3, 0)
  for (let p = first; p < maxPrice; p += interval) {
    priceLabel(dp(p, quoteDp))
  }
}
