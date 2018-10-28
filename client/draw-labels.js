drawLabels = (canvas, extents) => {
  const ctx = canvas.getContext('2d')
  const minPrice = extents.minPrice
  const maxPrice = extents.maxPrice
  const minTime = extents.minTime
  const maxTime = extents.maxTime
  const toX = extents.toX
  const toY = extents.toY
  const dp = (x, dp) => Number.parseFloat(x).toFixed(dp)

  const priceLabel = (p) => {
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffffa0'
    ctx.shadowColor = '#000000d0'
    ctx.shadowBlur = 6
    ctx.textAlign = 'left'
    ctx.fillText(p, 0, toY(p))
    ctx.textAlign = 'right'
    ctx.fillText(p, canvas.width, toY(p))
    division(0, toY(p), canvas.width, toY(p))
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
    ctx.fillStyle = '#ffffffe0'
    ctx.shadowColor = '#000000e0'
    ctx.shadowBlur = 6
    ctx.font = '26px helvetica,arial bold'
    ctx.textBaseline = 'bottom'
    ctx.textAlign = align
    ctx.fillText(label, toX(time), canvas.height)
    division(toX(time), 0, toX(time), canvas.height)
  }

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

  ctx.shadowBlur = 0
}
