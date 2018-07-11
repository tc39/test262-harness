'use strict';

const cp = require('child_process');
const path = require('path');
const tap = require('tap');

const sameMembers = (assert, actual, expected) => {
  const expectedSet = new Set(expected.map((expectedMember) => {
    return expectedMember.split('/').join(path.sep);
  }));
  assert.equal(actual.length, expected.length);

  for (let actualMember of actual) {
    assert.assert(expectedSet.has(actualMember), actualMember);
  }
};

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

tap.test('file matching: file name', assert => {
  run(['test/collateral-nested/test/evens/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral-nested/test/mixed/2.js'
    ])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names (outside of Test262 directory)', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral/test/strict.js'
    ])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral/test/strict.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: any directory (shallow)', assert => {
  run(['test/collateral-nested/test/*/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: any directory (deep)', assert => {
  run(['test/collateral-nested/test/**/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js',
        'test/collateral-nested/test/mixed/deep/2.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});


tap.test('file matching: glob: partial filename', assert => {
  run(['test/collateral-nested/test/**/2*.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/deep/26.js',
        'test/collateral-nested/test/mixed/23.js',
        'test/collateral-nested/test/mixed/2.js',
        'test/collateral-nested/test/mixed/deep/26.js',
        'test/collateral-nested/test/mixed/deep/2.js',
        'test/collateral-nested/test/odds/23.js'
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: partial directory name', assert => {
  run(['test/collateral-nested/test/*s/*.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/42.js',
        'test/collateral-nested/test/odds/23.js',
        'test/collateral-nested/test/odds/3.js',
      ];
      sameMembers(assert, actual, expected);
    }).then(assert.done, assert.fail);
});
