const framework = require('./framework');

const { options, logger, exchange } = framework.initBot([])

const bot = async () => {
  const accounts = await exchange.accounts()
  logger.info(accounts)
}
bot().then(() => { process.exit() })
