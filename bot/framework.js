if (process.framework) {
  Object.keys(process.framework).map(k => exports[k] = process.framework[k])
  return
}
const coinbasepro = require('../coinbasepro-exchange');
const LoggerFactory = require('../logger')
const commandLineArgs = require('command-line-args')
const logger = LoggerFactory.createLogger(`${process.argv[1]}.log`)

exports.init = async (optionDefinitions) => {
  optionDefinitions.unshift({ name: 'help', alias: 'h', type: Boolean, defaultValue: false, description: 'Show this help' })
  let options
  try {
    options = commandLineArgs(optionDefinitions)
  } catch (e) {
    logger.sync.error(`Options error: ${e.toString()}\nOptionDefs: ${JSON.stringify(optionDefinitions)}\nCmd Line: ${process.argv}\n`)
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
    const msg = `${new Date()} coinbasepro bot.\nCalled with: ${JSON.stringify(options)}\nUsage: ${usage}`
    console.log(msg)
    logger.sync.info(msg)
    process.exit()
  }

  await coinbasepro.ready(options.product)
  const exchange = coinbasepro.createExchange(options, logger)
  return {
    options: options,
    logger: logger,
    exchange: exchange,
  }
}

exports.close = process.exit

exports.handleError = e => {
  logger.sync.error('Bot run error: ', e)
  process.exit()
}
