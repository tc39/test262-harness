const tape = require('tape');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

Promise.all([
  run(['test/collateral/**/*.js']),
  run(['--prelude', './test/test-prelude.js', 'test/collateral/bothStrict.js'])
])
.then(validate)
.catch(reportRunError);

function reportRunError(error) {
  console.error("Error running tests");
  console.error(error.stack);
  process.exit(1);
}

function run(extraArgs) {
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
}

function validate(records) {
  const [normal, prelude] = records;
  validateResultRecords(normal);
  validateResultRecords(prelude, { prelude: true });
}

function validateResultRecords(records, options = { prelude: false }) {
  records.forEach(record => {

    const description = options.prelude ?
      `${record.attrs.description} with prelude` :
      record.attrs.description;

    tape(description, test => {
      test.assert(record.attrs.expected, 'Test has an "expected" frontmatter');
      if (!record.attrs.expected) {
        // can't do anything else
        test.end();
        return;
      }

      test.equal(record.result.pass, record.attrs.expected.pass, 'Test passes or fails as expected');

      if (record.attrs.expected.message) {
        test.equal(record.result.message, record.attrs.expected.message, 'Test fails with appropriate message');
      }

      if (options.prelude) {
        test.assert(record.rawResult.stdout.indexOf("prelude!") > -1, 'Has prelude content');
      }

      test.end();
    });
  });
}
