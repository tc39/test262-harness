const cp = require('child_process');

module.exports = function run(extraArgs) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let args = [
        '--hostType', 'node',
        '--hostPath', process.execPath,
        '-r', 'json',
        '--includesDir', './test/test-includes',
      ].concat(extraArgs);

    const child = cp.fork('bin/run.js', args, { silent: true });

    child.stdout.on('data', (data) => { stdout += data });
    child.stderr.on('data', (data) => { stderr += data });
    child.on('exit', () => {
      if (stderr) {
        return reject(new Error(`Got stderr: ${stderr.toString()}`));
      }

      try {
        resolve(JSON.parse(stdout));
      } catch(e) {
        reject(e);
      }
    });
  });
};
