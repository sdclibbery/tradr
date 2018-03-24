const framework = require('./framework')

const { options, logger, exchange } = framework.initBot([])

const bot = async () => {
  const accounts = await exchange.accounts()
  const dp2 = (x) => Number.parseFloat(x).toFixed(2)
  let accountInfo = ''
  Object.keys(accounts).map(cur => {
    accountInfo = `${accountInfo}\n${cur}: balance ${dp2(accounts[cur].balance)} ${cur}; available: ${dp2(accounts[cur].available)} ${cur}`
  })
  logger.info(`BOT: Account balances: ${accountInfo}`)
  await (new Promise(r => setTimeout(r, 1000)))
}
bot()
.then(process.exit)
.catch(e => {
  logger.error(e)
  await (new Promise(r => setTimeout(r, 1000)))
  process.exit()
})
