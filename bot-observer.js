const GdaxExchange = require('./gdax-exchange');
const LoggerFactory = require('./logger')

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
  { name: 'product', alias: 'p', type: String, defaultValue: 'BTC-EUR' },
]
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

if (options.help) {
  console.log(
  `GDAX bot. Usage:
   --help: -h: Show this help
   --product: -p: GDAX product; defaults to BTC-EUR
  `)
  process.exit()
}

const logger = LoggerFactory.createLogger(`${process.argv[1]}.log`)
const exchange = GdaxExchange.createExchange(options, logger)

const bot = async () => {
  const baseCurrency = options.product.split('-')[0]
  const quoteCurrency = options.product.split('-')[1]
  while (true) {
    const {price: newPrice} = await exchange.waitForPriceChange()
    logger.warn(`BOT: New price: ${newPrice} ${quoteCurrency} per ${baseCurrency}`)
  }
}
bot().then(() => { process.exit() })
