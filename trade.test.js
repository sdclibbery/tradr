const Trade = require('./trade');

test('bull starts a trade on first update', () => {
  const trade = Trade.bull(10)
  expect(trade(100, 't')).toContain('starting trade')
})
