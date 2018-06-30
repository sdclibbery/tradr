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

  const line = (s, e) => {
    ctx.strokeStyle = '#000000'//'#303030c0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(e.x, e.y)
    ctx.stroke()
  }

  const lines = (ls) => {
    ls.forEach((from, idx, h) => {
      const to = h[idx+1]
      if (to) { line(from, to) }
    })
  }

  ctx.shadowColor = 'white'
  ctx.shadowBlur = 0

  const highs = candles.map(c => { return { x:(c.time*1000), y:(c.high) } }).reverse()
  lines(hull(highs).map(({x,y}) => { return {x:toX(x), y:toY(y)} }))

}

const hull = (points) => {
  const initialHull = [points.shift(), points.pop()]
  return points.reduce(extendHull, initialHull)
}

const extendHull = (partialHull, point) => {
  const iNext = partialHull.filter(({x}) => x < point.x).length
  const iPrev = iNext - 1
  const pp = partialHull[iPrev]
  const pn = partialHull[iNext]
  if (isBelowLine(pp, pn, point)) { return partialHull }
  return partialHull.slice(0, iNext).concat(point, partialHull.slice(iNext))
}

const isBelowLine = (ls, le, p) => {
  const m = (le.y - ls.y) / (le.x - ls.x)
  const c = ls.y - m*ls.x
  const yAtP = m*p.x + c
  return p.y < yAtP
}

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nCandle analysis test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

assertSame(isBelowLine({x:0,y:1}, {x:2,y:1}, {x:1,y:2}), false)
assertSame(isBelowLine({x:0,y:1}, {x:2,y:1}, {x:1,y:1}), false)
assertSame(isBelowLine({x:0,y:1}, {x:2,y:1}, {x:1,y:0}), true)
assertSame(isBelowLine({x:0,y:1}, {x:2,y:5}, {x:1,y:3.1}), false)
assertSame(isBelowLine({x:0,y:1}, {x:2,y:5}, {x:1,y:2.9}), true)

assertSame(extendHull([{x:0,y:1}, {x:2,y:1}], {x:1,y:2}), [{x:0,y:1}, {x:1,y:2}, {x:2,y:1}])
assertSame(extendHull([{x:0,y:1}, {x:2,y:1}], {x:1,y:0}), [{x:0,y:1}, {x:2,y:1}])

assertSame(hull([{x:0,y:1}, {x:1,y:1}]), [{x:0,y:1}, {x:1,y:1}])
assertSame(hull([{x:0,y:1}, {x:1,y:2}, {x:2,y:1}]), [{x:0,y:1}, {x:1,y:2}, {x:2,y:1}])
assertSame(hull([{x:0,y:1}, {x:1,y:0}, {x:2,y:1}]), [{x:0,y:1}, {x:2,y:1}])
//assertSame(hull([{x:0,y:1}, {x:1,y:1.1}, {x:2,y:1}]), [{x:0,y:1}, {x:2,y:1}])
// ? better algo: start with ALL points in hull, and remove any points that are
//    below the line formed by the points either side
