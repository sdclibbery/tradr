drawCandles = (canvas, candles, granularity, extents) => {
  const ctx = canvas.getContext('2d')

  const minPrice = extents.minPrice
  const maxPrice = extents.maxPrice
  const minTime = extents.minTime
  const maxTime = extents.maxTime
  const barW = canvas.width/300
  const toX = extents.toX
  const toY = extents.toY
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)
  const meanVolume = extents.meanVolume

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

  drawLabels(canvas, extents)
}
