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
