const { spawn } = require('child_process')

exports.spawn = (args) => {
  const command = process.argv[0]
  console.log(`${new Date()} Spawning bot ${command} ${args.join(' ')}`);
  const subprocess = spawn(command, args, {
    cwd: './bot',
    detached: true,
    stdio: 'ignore',
  })
  subprocess.on('error', (err) => {
    console.error(`${new Date()} Failed to spawn bot ${command} ${args.join(' ')}: `, err);
  });
  subprocess.unref()
}
