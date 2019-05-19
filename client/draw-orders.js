drawOrders = (canvas, orders, extents) => {
  var ctx = canvas.getContext('2d')

  const toX = extents.toX
  const toY = extents.toY
  const num = x => Number.parseFloat(x)

  const orderBar = (o) => {
    const color = ({filled:'#0000e0', open:'#d0c000'}[o.status]) || '#d000d0'
    ctx.fillStyle = color+'10'
    ctx.strokeStyle = color+'20'
    const defaultEndTime = (o.status == 'open') ? new Date() : o.created
    const x1 = toX(new Date(o.created))
    const x2 = toX(new Date(o.closeTime || defaultEndTime))
    const y1 = toY(num(o.priceAtCreation))
    const y2 = toY(num(o.fillPrice) || num(o.orderPrice) || num(o.priceAtCreation))
    ctx.fillRect(x1, y1, x2-x1, y2-y1)
    ctx.strokeRect(x1, y1, x2-x1, y2-y1)
  }

  ctx.lineWidth = 4
  ctx.shadowBlur = 0
  orders.forEach(orderBar)
}
