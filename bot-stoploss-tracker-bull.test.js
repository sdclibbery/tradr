const Bot = require('./bot-stoploss-tracker-bull');

const defaultOptions = {
  product: 'BTC-EUR',
  amount: 10,
  stoploss: 10,
  type: 'bull',
}

test('buys in on first update', () => {
  const bot = Bot.bot(defaultOptions, mockExchange)
  bot(100, 't')
  const marketPrice = undefined
  expect(mockExchange.buy).toBeCalledWith(marketPrice, 10, expect.any(Function))
})

test('places stoploss order', () => {
  const bot = Bot.bot(defaultOptions, mockExchange)
  bot(100, 't')
  callbackAfterBuy()
  expect(mockExchange.sell).toBeCalledWith(90, 0.099, expect.any(Function))
})

test('does nothing if price moves down a bit', () => {
  const bot = initiatedBot()
  expect(bot(95, 't')).toBe(undefined)
})

test('exits if price falls below stop loss', () => {
  const bot = initiatedBot()
  expect(bot(89, 't')).toContain('trade complete')
})

test('done function indicates completion', () => {
  const bot = initiatedBot()
  bot(89, 't')
  expect(bot.done()).toBe(true)
})

test('cancels previous stoploss if price moves up', () => {
  const bot = initiatedBot()
  callbackAfterSell()
  expect(bot(105, 't')).toContain('moving stop loss to: 94.5')
  expect(mockExchange.cancel).toBeCalledWith(12345, expect.any(Function))
})

test('raises stoploss if price moves up', () => {
  const bot = initiatedBot()
  expect(bot(105, 't')).toContain('moving stop loss to: 94.5')
})

test('raises stoploss again if price moves up further', () => {
  const bot = initiatedBot()
  bot(105, 't')
  expect(bot(110, 't')).toContain('moving stop loss to: 99')
})

test('reports correct profit after completing', () => {
  const bot = initiatedBot()
  bot(105, 't')
  bot(110, 't')
  bot(115, 't')
  expect(bot(101, 't')).toContain('profit 0.25')
})

let mockExchange = undefined
beforeEach(() => {
  mockExchange = {
    buy: jest.fn(),
    sell: jest.fn(),
    cancel: jest.fn(),
  }
});

const initiatedBot = () => {
  const bot = Bot.bot(defaultOptions, mockExchange)
  bot(101, 't')
  callbackAfterBuy()
  return bot
}

const callbackAfterBuy = () => {
  const buyCallback = mockExchange.buy.mock.calls[0][2]
  buyCallback(12345, 100, 0.099)
}

const callbackAfterSell = () => {
  const sellCallback = mockExchange.sell.mock.calls[0][2]
  sellCallback(12345)
}

const callbackAfterSCancel = () => {
  const cancelCallback = mockExchange.cancel.mock.calls[0][1]
  cancelCallback()
}
