const Trade = require('./trade');

const defaultBullOptions = {
  product: 'BTC-EUR',
  amount: 1,
  stoploss: 10,
  type: 'bull',
}

const defaultBearOptions = {
  product: 'BTC-EUR',
  amount: 1,
  stoploss: 10,
  type: 'bear',
}

/*
test('bull buys in on first update', () => {
  const trade = Trade.trade(defaultBullOptions)
  const buy = jest.fn()
  trade(100, 't', buy)
  expect(buy).toBeCalledWith(100, )
})
*/

test('bull starts a trade on first update', () => {
  const trade = Trade.trade(defaultBullOptions)
  expect(trade(100, 't')).toContain('starting trade')
})

test('bull does nothing if price moves down a bit', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  expect(trade(95, 't')).toBe(undefined)
})

test('bull exits if price falls below stop loss', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  expect(trade(89, 't')).toContain('trade complete')
})

test('done function indicates completion', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  trade(89, 't')
  expect(trade.done()).toBe(true)
})

test('bull raises stoploss if price moves up', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  expect(trade(105, 't')).toContain('moving stop loss to: 94.5')
})

test('bull raises stoploss again if price moves up further', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  trade(105, 't')
  expect(trade(110, 't')).toContain('moving stop loss to: 99')
})

test('bull reports correct profit after completing', () => {
  const trade = Trade.trade(defaultBullOptions)
  trade(100, 't')
  trade(105, 't')
  trade(110, 't')
  trade(115, 't')
  expect(trade(101, 't')).toContain('profit 1.00%')
})

test('bear reports correct profit after completing', () => {
  const trade = Trade.trade(defaultBearOptions)
  trade(100, 't')
  expect(trade(111, 't')).toContain('profit -11.00%')
})
