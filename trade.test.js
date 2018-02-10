const Trade = require('./trade');

test('bull starts a trade on first update', () => {
  const trade = Trade.bull(10)
  expect(trade(100, 't')).toContain('starting trade')
})

test('bull does nothing if price moves down a bit', () => {
  const trade = Trade.bull(10)
  trade(100, 't')
  expect(trade(95, 't')).toBe(undefined)
})

test('bull exits if price falls below stop loss', () => {
  const trade = Trade.bull(10)
  trade(100, 't')
  expect(trade(89, 't')).toContain('trade complete')
})

test('bull raises stoploss if price moves up', () => {
  const trade = Trade.bull(10)
  trade(100, 't')
  expect(trade(105, 't')).toContain('moving stop loss to: 94.5')
})

test('bull raises stoploss again if price moves up further', () => {
  const trade = Trade.bull(10)
  trade(100, 't')
  trade(105, 't')
  expect(trade(110, 't')).toContain('moving stop loss to: 99')
})

test('bull raises stoploss again if price moves up further', () => {
  const trade = Trade.bull(10)
  trade(100, 't')
  trade(105, 't')
  trade(110, 't')
  trade(115, 't')
  expect(trade(101, 't')).toContain('profit 1%')
})
