var path = require('path'),
    util  = require('util'),
    fs   = require('fs');

var Logger = function (logFilePath) {
  logFilePath = path.normalize(logFilePath)
  this.stream = fs.createWriteStream(logFilePath, {flags: 'a', encoding: 'utf8', mode: 0666})
  this.stream.write("\n")
  this.write = (text) => {
    this.stream.write(text)
    console.log(text)
  }
  this.writeSync = (text) => {
    console.log(text)
    fs.writeFileSync(logFilePath, text)
  }
}

Logger.prototype.format = (level, values) => {
  let content = ''
  values.forEach((v) => {
    if (typeof v === 'string') {
      content += ' ' + v
    } else {
      content += ' ' + util.inspect(v, false, null)
    }
  })
  return [level, ' [', new Date(), '] ', content].join('')
}

Logger.prototype.debug = function (...args) { this.write(this.format('debug', args) + "\n") }
Logger.prototype.info = function (...args) { this.write(this.format('info', args) + "\n") }
Logger.prototype.warn = function (...args) { this.write(this.format('warn', args) + "\n") }
Logger.prototype.error = function (...args) { this.write(this.format('error', args) + "\n") }

exports.Logger = Logger
exports.createLogger = (log_file_path) => {
  return new Logger(log_file_path)
}
