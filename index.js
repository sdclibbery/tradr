const BotStoplossTrackerBull = require('./bot-stoploss-tracker-bull');
const GdaxExchange = require('./gdax-exchange');

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR' },
  { name: 'amount', alias: 'a', type: Number },
  { name: 'buyin', alias: 'b', type: Boolean, defaultValue: false },
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
 --buyin: -b: whether to start the bot run by purchasing the currency
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
o Move logging to the exchange
o Pull a proper clean return value interface out into gdax exchange, dont just pass returned data structure back to the bot...
o Get rounding values from the product info, dont hardcode
o Work out buyInPrice properly
o Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
 o Could even do this graduated; so exit 25% at 1% profit etc
 o This would probably be uselful for bots on automatic triggers...
*/
