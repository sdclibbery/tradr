drawCandleAnalysis = (canvas, candles, granularity, extents) => {
  var ctx = canvas.getContext('2d')

  const minPrice = extents.minPrice
  const maxPrice = extents.maxPrice
  const minTime = extents.minTime
  const maxTime = extents.maxTime
  const toX = extents.toX
  const toY = extents.toY

  const line = (s, e) => {
    ctx.strokeStyle = '#30303030'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(e.x, e.y)
    ctx.stroke()
  }

  const lines = (ls) => {
    ls
     .map(({x,y}) => { return {x:toX(x), y:toY(y)} })
     .forEach((from, idx, h) => {
      const to = h[idx+1]
      if (to) { line(from, to) }
    })
  }

  ctx.shadowColor = 'white'
  ctx.shadowBlur = 0

  let highs = candles.map(c => { return { x:(c.time*1000), y:(c.high) } }).reverse()
  highs = reduceAnd(highs, 4, () => {}, (l,r) => l<r)
  highs = reduceAnd(highs, 5, lines, (l,r) => l<r)

  let lows = candles.map(c => { return { x:(c.time*1000), y:(c.low) } }).reverse()
  lows = reduceAnd(lows, 4, () => {}, (l,r) => l>r)
  lows = reduceAnd(lows, 5, lines, (l,r) => l>r)
}

const reduceAnd = (hull, times, action, predicate) => {
  for (let i=0; i<times; i++) {
    hull = reduceToHull(hull, predicate)
    action(hull)
  }
  return hull
}

const reduceToHull = (partialHull, predicate) => {
  const betterHull = []
  partialHull.forEach((p, idx, h) => {
    const prev = h[idx-1]
    const next = h[idx+1]
    if (!prev || !next || !isOutside(prev, next, p, predicate)) {
      betterHull.push(p)
    }
  })
  return betterHull
}

const isOutside = (ls, le, p, predicate) => {
  const m = (le.y - ls.y) / (le.x - ls.x)
  const c = ls.y - m*ls.x
  const yAtP = m*p.x + c
  return predicate(p.y, yAtP)
}

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nCandle analysis test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

assertSame(isOutside({x:0,y:1}, {x:2,y:1}, {x:1,y:2}, (l,r)=>l<r), false)
assertSame(isOutside({x:0,y:1}, {x:2,y:1}, {x:1,y:1}, (l,r)=>l<r), false)
assertSame(isOutside({x:0,y:1}, {x:2,y:1}, {x:1,y:0}, (l,r)=>l<r), true)
assertSame(isOutside({x:0,y:1}, {x:2,y:5}, {x:1,y:3.1}, (l,r)=>l<r), false)
assertSame(isOutside({x:0,y:1}, {x:2,y:5}, {x:1,y:2.9}, (l,r)=>l<r), true)

assertSame(reduceToHull([{x:0,y:1}, {x:1,y:1}], (l,r)=>l<r), [{x:0,y:1}, {x:1,y:1}])
assertSame(reduceToHull([{x:0,y:1}, {x:1,y:2}, {x:2,y:1}], (l,r)=>l<r), [{x:0,y:1}, {x:1,y:2}, {x:2,y:1}])
assertSame(reduceToHull([{x:0,y:1}, {x:1,y:0}, {x:2,y:1}], (l,r)=>l<r), [{x:0,y:1}, {x:2,y:1}])
assertSame(reduceToHull([{x:0,y:1}, {x:1,y:1.1}, {x:2,y:2}], (l,r)=>l<r), [{x:0,y:1}, {x:2,y:2}])
// ? better algo: start with ALL points in hull, and remove any points that are
//    below the line formed by the points either side
