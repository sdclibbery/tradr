const { spawn } = require('child_process');
const frame =  require('./frame').apply
const fs = require('fs')
const process = require('process')
const findProcess = require('find-process');

exports.render = async (req, res, next) => {
  res.send(frame(`
    <h1>Tradr Bot Management</h1>
    <h3>Bots</h3>
    ${await botList()}
  `))
}

const botList = async () => {
  return (await Promise.all(
    fs.readdirSync('../bot')
    .filter(f => f.startsWith('bot-') && f.endsWith('.js'))
    .map(async (bot) => {
      return `
        <p>${bot}
          <a href="/bot/log/${bot}.log">log</a>
          ${postButton('/bot/start/'+bot, '&#x25b6;')}
          ${postButton('/bot/stop/'+bot, '&#x23f9;')}
          ${(await getPidsFor(bot)).join('&nbsp;')}
        </p>
      `})
    )).join('<br/>')
}

const postButton = (link, title) => {
  return `<form style="display:inline" action="${link}" method="post"><input type="text" name="args"><input type="submit" value="${title}"></form>`
}

const getPidsFor = async (bot) => {
  return (await findProcess('name', bot)).map(p => p.pid)
}

exports.start = (req, res) => {
  const args = req.body.args.split(' ').filter(a => a !== null && a !== '')
  args.unshift(req.params.bot)
  const subprocess = spawn(process.argv[0], args, {
    cwd: '../bot',
    detached: true,
    stdio: 'ignore',
  })
  subprocess.unref()
  res.redirect(`/bot/log/${req.params.bot}.log`)
}

exports.stop = (req, res, next) => {
  getPidsFor(req.params.bot).then((procs) => {
    procs.map(p => process.kill(p, 'SIGKILL'))
    res.redirect(`/bot/log/${req.params.bot}.log`)
  }).catch(next)
}
