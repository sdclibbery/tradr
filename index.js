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
o Use proper rounding and conversion based on the product data feed
   And, do it in the exchange, NOT the bot...
   And, do it for everything including stoploss etc; they should all call gdax with valid string values
! Maybe it SHOULDNT buy-in itself? It'll either pay fees, or have to wait for a move in the 'wrong' direction...
   Maybe it should just take assignment of some preexisting coins and move a stoploss around them..?
o Pull a proper clean return value interface out into gdax exchange, dont just pass returned data structure back to the bot...
o Work out buyInPrice properly
o Possible tweak to the bot: exit anyway after making x% profit; don't wait for the stoploss - cmd line arg controls
 o Could even do this graduated; so exit 25% at 1% profit etc
 o This would probably be uselful for bots on automatic triggers...
*/
