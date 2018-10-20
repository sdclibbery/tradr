drawOrderBook = (canvas, book, extents) => {
  var ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY
  const min = extents.minPrice
  const max = extents.maxPrice

  const drawBucket = (maxVolume) => ({lo, hi, volume}) => {
    ctx.fillStyle = '#00a0a040'
    const w = volume*canvas.width/5/maxVolume
    ctx.fillRect(canvas.width-w, toY(lo), w, toY(hi)-toY(lo))
  }

  const buckets = book.bids
    .concat(book.asks)
    .reduce(bucket(min, max), [])
  const maxVolume = buckets.map(({volume}) => volume).reduce((v,a) => Math.max(v,a), 0)
  buckets.map(drawBucket(maxVolume))
}

const bucket = (min, max) => (buckets, order) => {
  if (order.price < min || order.price > max) { return buckets }
  const size = (max-min)/50
  const lo = Math.floor(order.price / size) * size
  getOrAddBucket(buckets, lo, lo+size).volume += parseFloat(order.volume)
  return buckets
}

const getOrAddBucket = (buckets, lo, hi) => {
  let b = buckets.filter(({lo:blo}) => blo == lo)[0]
  if (!b) {
    b = {lo:lo, hi:hi, volume:0}
    buckets.push(b)
  }
  return b
}

//-----

assertSame = (actual, expected) => {
  if (JSON.stringify(actual) != JSON.stringify(expected)) {
    console.log('\nCandle analysis test failed!!!')
    console.log(' Expected: ', expected)
    console.log(' Actual: ', actual)
    console.trace()
  }
}

const o1 = {price:1, volume:1}
const o2 = {price:2, volume:2}
const o10 = {price:10, volume:10}
assertSame(bucket(0,500)([], o1), [{lo:0, hi:10, volume:1}])
assertSame(bucket(0,500)([], o2), [{lo:0, hi:10, volume:2}])
assertSame(bucket(0,500)([{lo:0, hi:10, volume:1}], o2), [{lo:0, hi:10, volume:3}])
assertSame(bucket(0,500)([], o10), [{lo:10, hi:20, volume:10}])
assertSame(bucket(0,500)([{lo:0, hi:10, volume:1}], o10), [{lo:0, hi:10, volume:1}, {lo:10, hi:20, volume:10}])
assertSame(bucket(100,600)([], o1), [])
assertSame(bucket(-500,0)([], o1), [])
