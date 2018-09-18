drawOrders = (canvas, orders, extents) => {
  var ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY

  const orderBar = (o) => {
    const color = ({filled:'#00c000', cancelled:'#800000'}[o.status]) || '#404040'
    ctx.fillStyle = color+'20'
    ctx.strokeStyle = color+'40'
    const x1 = toX(new Date(o.created))
    const x2 = toX(new Date(o.closeTime || new Date()))
    const y1 = toY(o.priceAtCreation)
    const y2 = toY(o.fillPrice || o.orderPrice)
    ctx.fillRect(x1, y1, x2-x1, y2-y1)
    ctx.strokeRect(x1, y1, x2-x1, y2-y1)
  }

  orders.forEach(orderBar)
}
