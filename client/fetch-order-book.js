fetchOrderBook = (product) => {
  return fetch(`https://api.pro.coinbase.com/products/${product}/book?level=2`)
    .then(res => res.json())
    .then(book => {
      return {
        bids: book.bids.map(toOrder),
        asks: book.asks.map(toOrder),
      }
    })
}

const toOrder = o => {
  return { price:o[0], volume:o[1] }
}
