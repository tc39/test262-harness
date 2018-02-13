const tap = require('tap');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

Promise.all([
  run(['test/collateral/**/*.js']),
  run(['--prelude', './test/fixtures/prelude.js', 'test/collateral/bothStrict.js']),
  run(['--reporter-keys', 'attrs,result', 'test/collateral/bothStrict.js']),
  run(['--reporter-keys', 'rawResult,attrs,result', 'test/collateral/bothStrict.js']),
  run(['--reporter-keys', 'attrs,rawResult,result', 'test/collateral/bothStrict.js']),
  run(['--reporter-keys', 'attrs,result,rawResult', 'test/collateral/bothStrict.js']),
  run(['--babelPresets', 'stage-3', '--reporter-keys', 'attrs,result,rawResult', 'test/babel-collateral/spread-sngl-obj-ident.js'])
])
.then(validate)
.catch(reportRunError);

function reportRunError(error) {
  console.error('Error running tests');
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
  const [
    normal,
    prelude,
    withoutRawResult,
    withRawResult1, withRawResult2, withRawResult3,
    babelResult
  ] = records;
  validateResultRecords(normal);
  validateResultRecords(prelude, { prelude: true });
  validateResultRecords(withoutRawResult, { noRawResult: true });
  validateResultRecords(withRawResult1);
  validateResultRecords(withRawResult2);
  validateResultRecords(withRawResult3);
  validateResultRecords(babelResult);
}

function validateResultRecords(records, options = { prelude: false }) {
  records.forEach(record => {

    const description = options.prelude ?
      `${record.attrs.description} with prelude` :
      record.attrs.description;

    tap.test(description, test => {

      if (typeof record.strictMode !== 'undefined') {
        if (record.contents.startsWith('"use strict"')) {
          test.equal(record.strictMode, true);
        } else {
          test.equal(record.strictMode, false);
        }
      }

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

      if (options.noRawResult) {
        test.equal(record.rawResult, undefined);
      } else {
        test.equal(typeof record.rawResult, 'object');
      }

      test.end();
    });
  });
}
