drawOrderBook = (canvas, book, extents) => {
  var ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const orderBar = (colour) => {
    return ({price, volume}) => {
      ctx.fillStyle = colour+'50'
      const w = volume*20
      ctx.fillRect(canvas.width-w, toY(price)-2.5, w, 5)
    }
  }

  book.bids.map(orderBar('#a00000'))
  book.asks.map(orderBar('#00a000'))
}
