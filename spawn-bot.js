const { spawn } = require('child_process')

exports.spawn = (bot, args) => {
  const nodeExe = process.argv[0]
  const argsWithBotScript = [bot].concat(args)
  console.log(`${new Date()} Spawning bot ${nodeExe} ${argsWithBotScript.join(' ')}`);
  const subprocess = spawn(nodeExe, argsWithBotScript, {
    cwd: './bot',
    detached: true,
    stdio: 'ignore',
  })
  subprocess.on('error', (err) => {
    console.error(`${new Date()} Failed to spawn bot ${nodeExe} ${argsWithBotScript.join(' ')}: `, err);
  });
  subprocess.unref()
}
