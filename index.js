const BotStoplossTrackerBull = require('./bot-stoploss-tracker-bull');
const GdaxExchange = require('./gdax-exchange');

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR' },
  { name: 'amount', alias: 'a', type: Number },
  { name: 'stoploss', alias: 's', type: Number, defaultValue: 1 },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
if (options.help || !options.amount) {
console.log(
`GDAX bot. Usage:
 --help: -h: Show this help
 --product: -p: GDAX product; defaults to BTC-EUR
 --amount: -a: amount to bot with in quote currency, eg in EUR for BTC-EUR; *must* be specified
 --stoploss: -s: percentage offset for stoploss exit order; defaults to 1
`)
  process.exit()
}

BotStoplossTrackerBull
  .bot(options, GdaxExchange.createExchange(options))
  .then(() => { console.log('done :-)') })
  .catch((e) => {
    console.error(e)
    process.exit()
  })

/*
ToDo
x Write algorithm
x waitForPriceChange
x stopLoss
x cancelOrder
x buy in
 x Use a (feeless) limit order not a market order
 x wait for order to fill before returning
 x waitForOrderFill
! Maybe it SHOULDNT buy-in itself? It'll either pay fees, or have to wait for a move in the 'wrong' direction...
   Maybe it should just take assignment of some preexisting coins and move a stoploss around them..?
 x Add an arg to choose whether to buy in
x Move rounding to the exchange and do it for every appropriate value
x Have an event emitter leak
 x Ask for order status, dont wait for it to fill
x Move logging to the exchange
x Seeing a lot of 'invalid signature' errors when price rises and the stoploss changes
x Failed to detect the stoploss filling
x Price keeps falling PAST the stoploss without triggering it! Is that because its a limit stoploss?
 x Fix by changing stoploss to a market order, even though that'll incur a fee
x Profit should be calculated using ACTUAL stoploss amount including fees
x Remove buyin option from this bot
o Log all API call data to a log file, with timings
o Get rounding values from the product info, dont hardcode
o Pull a proper clean return value interface out into gdax exchange, dont just pass returned data structure back to the bot...
o Encourage multiple bots and bot composition
o Make a simple, patient bot, that just uses limit orders to buy low and sell high...
o Write a bot to exploit spread on markets with a high spread
 o Monitor the spread; if its large, eg >0.5% of value
 o Then place buy AND sell orders at the edges of the spread
 o And re-place them as they fill
 o Cancel/move any as the spread moves
 o Have limits and stop if only one side keeps filling?
o Add a readme: API key / credentials, command line usage, writing bot algos
o Buyin improvements
 o Work out buyInPrice properly as minimum increment over current price
 o Buy in should retry if the order cant be placed
  o And possibly if the price moves away from it? Or it should nope out somehow?
o Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
 o Could even do this graduated; so exit 25% at 1% profit etc
 o This would probably be uselful for bots on automatic triggers...
*/
