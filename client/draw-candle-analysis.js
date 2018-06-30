drawCandleAnalysis = (canvas, candles, granularity) => {
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

  const line = ({x1, y1, x2, y2}) => {
    ctx.strokeStyle = '#303030c0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  ctx.shadowColor = 'white'
  ctx.shadowBlur = 0

  const highs = candles.map(c => { return { x:toX(c.time*1000), y:toY(c.high) } })
  hull(highs)//Now connect points with lines

}

const isBelowLine = (ls, le, p) => {
  const m = (le.y - ls.y) / (le.x - ls.x)
  const c = ls.y - m*ls.x
  const yAtP = m*p.x + c
  return p.y < yAtP
}

const isBelowHull = (h, p) => {
  const h1 = h.filter(({x}) => x > p.x)[0]
  const h2 = h.filter(({x}) => x < p.x).reverse()[0]
  if (!h1 || !h2) { return false }
  return isBelowLine(h1, h2, p)
}

const extendHull = (partialHull, point) => {
  if (isBelowHull(partialHull, point)) { return partialHull }
  return partialHull.concat(point)
}

const hull = (points) => {
  const initialHull = [points.shift(), points.pop()]
  return points.reduce(extendHull, initialHull)
}

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nCandle analysis test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

assertSame(isBelowHull([{x:0,y:1}, {x:2,y:1}], {x:1,y:2}), false)
assertSame(isBelowHull([{x:0,y:1}, {x:2,y:1}], {x:1,y:1}), false)
assertSame(isBelowHull([{x:0,y:1}, {x:2,y:1}], {x:1,y:0}), true)
assertSame(isBelowHull([{x:0,y:1}, {x:2,y:5}], {x:1,y:3.1}), false)
assertSame(isBelowHull([{x:0,y:1}, {x:2,y:5}], {x:1,y:2.9}), true)
assertSame(isBelowHull([{x:-1,y:0}, {x:0,y:0}, {x:2,y:1}], {x:1,y:1}), false)
assertSame(isBelowHull([{x:-1,y:0}, {x:0,y:0}, {x:2,y:1}], {x:1,y:0}), true)

assertSame(hull([{x:0,y:1}, {x:1,y:1}]), [{x:0,y:1}, {x:1,y:1}])
//assertSame(hull([{x:0,y:1}, {x:1,y:2}, {x:2,y:1}]), [{x:0,y:1}, {x:1,y:2}, {x:2,y:1}])
assertSame(hull([{x:0,y:1}, {x:1,y:0}, {x:2,y:1}]), [{x:0,y:1}, {x:2,y:1}])
