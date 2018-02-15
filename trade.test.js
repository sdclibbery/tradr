const Trade = require('./trade');

const defaultOptions = {
  product: 'BTC-EUR',
  amount: 10,
  stoploss: 10,
  type: 'bull',
}

test('buys in on first update', () => {
  const trade = Trade.trade(defaultOptions, mockExchange)
  trade(100, 't')
  const marketPrice = undefined
  expect(mockExchange.buy).toBeCalledWith(marketPrice, 10, expect.any(Function))
})

test('does nothing if price moves down a bit', () => {
  const trade = initiatedTrade()
  expect(trade(95, 't')).toBe(undefined)
})

test('exits if price falls below stop loss', () => {
  const trade = initiatedTrade()
  expect(trade(89, 't')).toContain('trade complete')
})

test('done function indicates completion', () => {
  const trade = initiatedTrade()
  trade(89, 't')
  expect(trade.done()).toBe(true)
})

test('raises stoploss if price moves up', () => {
  const trade = initiatedTrade()
  expect(trade(105, 't')).toContain('moving stop loss to: 94.5')
})

test('raises stoploss again if price moves up further', () => {
  const trade = initiatedTrade()
  trade(105, 't')
  expect(trade(110, 't')).toContain('moving stop loss to: 99')
})

test('reports correct profit after completing', () => {
  const trade = initiatedTrade()
  trade(105, 't')
  trade(110, 't')
  trade(115, 't')
  expect(trade(101, 't')).toContain('profit 0.25')
})

let mockExchange = undefined
beforeEach(() => {
  mockExchange = {
    buy: jest.fn(),
    sell: jest.fn(),
    cancel: jest.fn(),
  }
});

const initiatedTrade = () => {
  const trade = Trade.trade(defaultOptions, mockExchange)
  trade(101, 't')
  const buyCompleteCallback = mockExchange.buy.mock.calls[0][2]
  buyCompleteCallback(100, 0.099) // amount assumes a fee taken
  return trade
}
