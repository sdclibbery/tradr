const Trade = require('./trade');

const defaultBullOptions = {
  product: 'BTC-EUR',
  amount: 10,
  stoploss: 10,
  type: 'bull',
}

const defaultBearOptions = {
  product: 'BTC-EUR',
  amount: 10,
  stoploss: 10,
  type: 'bear',
}

test('bull buys in on first update', () => {
  const trade = Trade.trade(defaultBullOptions, mockExchange)
  trade(100, 't')
  const marketPrice = undefined
  expect(mockExchange.buy).toBeCalledWith(marketPrice, 10, expect.any(Function))
})

test('bull does nothing if price moves down a bit', () => {
  const trade = startedBullTrade()
  expect(trade(95, 't')).toBe(undefined)
})

test('bull exits if price falls below stop loss', () => {
  const trade = startedBullTrade()
  expect(trade(89, 't')).toContain('trade complete')
})

test('done function indicates completion', () => {
  const trade = startedBullTrade()
  trade(89, 't')
  expect(trade.done()).toBe(true)
})

test('bull raises stoploss if price moves up', () => {
  const trade = startedBullTrade()
  expect(trade(105, 't')).toContain('moving stop loss to: 94.5')
})

test('bull raises stoploss again if price moves up further', () => {
  const trade = startedBullTrade()
  trade(105, 't')
  expect(trade(110, 't')).toContain('moving stop loss to: 99')
})

test('bull reports correct profit after completing', () => {
  const trade = startedBullTrade()
  trade(105, 't')
  trade(110, 't')
  trade(115, 't')
  expect(trade(101, 't')).toContain('profit 1.00%')
})

test('bear reports correct profit after completing', () => {
  const trade = Trade.trade(defaultBearOptions, mockExchange)
  trade(99, 't')
  mockExchange.sell.mock.calls[0][2](100)
  expect(trade(111, 't')).toContain('profit -11.00%')
})

let mockExchange = undefined
beforeEach(() => {
  mockExchange = {
    buy: jest.fn(),
    sell: jest.fn(),
    cancel: jest.fn(),
  }
});

const startedBullTrade = () => {
  const trade = Trade.trade(defaultBullOptions, mockExchange)
  trade(99, 't')
  const buyCompleteCallback = mockExchange.buy.mock.calls[0][2]
  buyCompleteCallback(100)
  return trade
}
