fetchCandles = (product, granularity) => {
  return fetch(`https://api.pro.coinbase.com/products/${product}/candles?granularity=${granularity}`)
    .then(res => res.json())
    .then(cs => cs.map(candle => {
      return { time: candle[0], low: candle[1], high: candle[2], open: candle[3], close: candle[4], volume: candle[5] }
    }))
}
