const GdaxExchange = require('./gdax-exchange');
const LoggerFactory = require('./logger')
const commandLineArgs = require('command-line-args')

exports.initBot = (optionDefinitions) => {
  optionDefinitions.unshift({ name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' })

  const options = commandLineArgs(optionDefinitions)

  const missingButRequiredOptions = optionDefinitions
          .filter((o) => o.defaultValue == undefined)
          .filter((o) => options[o.name] == undefined)
  if (options.help || missingButRequiredOptions.length > 0) {
    const usageForOption = (o) => {
      const showRequirements = o.type != Boolean
      const requirements = o.defaultValue != undefined ? 'Defaults to ' + o.defaultValue : 'Required'
      return `--${o.name} -${o.alias} : ${o.description}${showRequirements ? '. '+requirements : ''}`
    }
    let usage = optionDefinitions.reduce((u,o) => `${u}\n${usageForOption(o)}.`, '')
    console.log(`GDAX bot. Usage:${usage}`)
    process.exit()
  }

  const logger = LoggerFactory.createLogger(`${process.argv[1]}.log`)
  const exchange = GdaxExchange.createExchange(options, logger)
  return {
    options: options,
    logger: logger,
    exchange: exchange,
  }
}
