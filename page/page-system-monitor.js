const os =  require('os')
const frame =  require('./frame').apply

exports.render = (req, res) => {
  res.send(frame(`
    <h1>${os.hostname()} pi monitor </h1>
    <p>System Memory: ${os.freemem()/1024/1024}Mb free out of ${os.totalmem()/1024/1024}Mb (${(100*os.freemem()/os.totalmem()).toFixed(1)}%)</p>
    <p>Heap Memory: ${JSON.stringify(process.memoryUsage())}</p>
    <p>System CPU load: ${os.loadavg()}</p>
    <p>Process CPU: ${JSON.stringify(process.cpuUsage())}</p>
    <p>System Uptime: ${secondsToHms(os.uptime())}</p>
    <p>Process Uptime: ${secondsToHms(process.uptime())}</p>
    <p><form action="/shutdown/app" method="POST"><input type="submit" value="Restart App"></input></form></p>
    <p><form action="/shutdown/pi" method="POST"><input type="submit" value="Shutdown Pi"></input></form></p>
  `))
}

const secondsToHms = (seconds) => {
  const days = Math.floor(seconds/24/60/60)
  var hhmmss = new Date(null);
  hhmmss.setSeconds(seconds);
  return `${days}d ${hhmmss.toISOString().substr(11, 8)}`
}
