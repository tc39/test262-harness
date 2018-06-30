'use strict';

const cp = require('child_process');
const tap = require('tap');
const path = require('path');

const sameMembers = (test, actual, expected) => {
  const expectedSet = new Set(expected.map((expectedMember) => {
    return expectedMember.split('/').join(path.sep);
  }));
  test.equal(actual.length, expected.length);

  for (let actualMember of actual) {
    test.assert(expectedSet.has(actualMember), actualMember);
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

tap.test('file matching: file name', (test) => {
  run(['test/collateral-nested/test/evens/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js'
      ];
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});

tap.test('file matching: file names', (test) => {
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
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});

tap.test('file matching: file names (outside of Test262 directory)', (test) => {
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
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});

tap.test('file matching: glob: any directory (shallow)', (test) => {
  run(['test/collateral-nested/test/*/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js'
      ];
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});

tap.test('file matching: glob: any directory (deep)', (test) => {
  run(['test/collateral-nested/test/**/2.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js',
        'test/collateral-nested/test/mixed/deep/2.js'
      ];
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});


tap.test('file matching: glob: partial filename', (test) => {
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
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});

tap.test('file matching: glob: partial directory name', (test) => {
  run(['test/collateral-nested/test/*s/*.js'])
    .then((results) => {
      const actual = results.map((result) => result.file);
      const expected = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/42.js',
        'test/collateral-nested/test/odds/23.js',
        'test/collateral-nested/test/odds/3.js',
      ];
      sameMembers(test, actual, expected);
    }).then(test.done, test.fail);
});
