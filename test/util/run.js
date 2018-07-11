'use strict';
const cp = require('child_process');
const path = require('path');
const binPath = path.join(__dirname, '../..', 'bin', 'run.js');

module.exports = function run(extraArgs, options) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let args = [
        '--hostType', 'node',
        '--hostPath', process.execPath,
        '-r', 'json',
        '--timeout', '2000',
      ].concat(extraArgs);

    let cwd = options && options.cwd;

    const child = cp.fork(binPath, args, { cwd, silent: true });

    child.stdout.on('data', (data) => { stdout += data });
    child.stderr.on('data', (data) => { stderr += data });
    child.on('exit', () => {
      if (stderr) {
        return reject(new Error(`Got stderr: ${stderr.toString()}`));
      }

      try {
        resolve({
          records: JSON.parse(stdout),
          options
        });
      } catch(e) {
        reject(e);
      }
    });
  });
};
