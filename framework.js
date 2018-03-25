const GdaxExchange = require('./gdax-exchange');
const LoggerFactory = require('./logger')
const commandLineArgs = require('command-line-args')

exports.initBot = (optionDefinitions) => {
  optionDefinitions.unshift({ name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' })

  let options
  try {
    options = commandLineArgs(optionDefinitions)
  } catch (e) {
    require('fs').writeFileSync(`${process.argv[1]}.log`, `Options error: ${e.toString()}\nOptionDefs: ${JSON.stringify(optionDefinitions)}\nCmd Line: ${process.argv}\n`, {flag:'a'})
  }

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
    const msg = `${new Date()} GDAX bot.\nCalled with: ${JSON.stringify(options)}\nUsage: ${usage}`
    console.log(msg)
    require('fs').writeFileSync(`${process.argv[1]}.log`, msg, {flag:'a'})
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
