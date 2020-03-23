'use strict';

const cp = require('child_process');
const path = require('path');
const tap = require('tap');

const sameMembers = (assert, actual, expected) => {
  const expectedSet = expected.map((expectedMember) => path.normalize(expectedMember));
  assert.equal(actual.length, expected.length, `
    Expected:

      ${actual}

    to have the same length as:

      ${expected}
  `);

  for (let actualMember of actual) {
    assert.assert(expectedSet.includes(actualMember), actualMember);
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
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral-nested/test/mixed/2.js'
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'mixed/2.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names (siblings)', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral-nested/test/evens/42.js'
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/42.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'evens/42.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: directories with name overlap', assert => {
  run([
      'test/collateral-nested-similar-names/test/get/index.js',
      'test/collateral-nested-similar-names/test/getOwnPropertyDescriptor/index.js',
      'test/collateral-nested-similar-names/test/getPrototypeOf/index.js',
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested-similar-names/test/get/index.js',
        'test/collateral-nested-similar-names/test/getOwnPropertyDescriptor/index.js',
        'test/collateral-nested-similar-names/test/getPrototypeOf/index.js',
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'get/index.js',
        'getOwnPropertyDescriptor/index.js',
        'getPrototypeOf/index.js',
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names (subdirectory first)', assert => {
  run([
      'test/collateral-nested/test/evens/deep/26.js',
      'test/collateral-nested/test/evens/2.js'
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/deep/26.js',
        'test/collateral-nested/test/evens/2.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/deep/26.js',
        'evens/2.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names (subdirectory second)', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral-nested/test/evens/deep/26.js'
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/deep/26.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'evens/deep/26.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: file names (outside of Test262 directory)', assert => {
  run([
      'test/collateral-nested/test/evens/2.js',
      'test/collateral/test/strict.js'
    ])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral/test/strict.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        '../../collateral/test/strict.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: any directory (shallow)', assert => {
  run(['test/collateral-nested/test/*/2.js'])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'mixed/2.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: any directory (deep)', assert => {
  run(['test/collateral-nested/test/**/2.js'])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/mixed/2.js',
        'test/collateral-nested/test/mixed/deep/2.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'mixed/2.js',
        'mixed/deep/2.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});


tap.test('file matching: glob: partial filename', assert => {
  run(['test/collateral-nested/test/**/2*.js'])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/deep/26.js',
        'test/collateral-nested/test/mixed/23.js',
        'test/collateral-nested/test/mixed/2.js',
        'test/collateral-nested/test/mixed/deep/26.js',
        'test/collateral-nested/test/mixed/deep/2.js',
        'test/collateral-nested/test/odds/23.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'evens/deep/26.js',
        'mixed/23.js',
        'mixed/2.js',
        'mixed/deep/26.js',
        'mixed/deep/2.js',
        'odds/23.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});

tap.test('file matching: glob: partial directory name', assert => {
  run(['test/collateral-nested/test/*s/*.js'])
    .then((results) => {
      const files = results.map((result) => result.file);
      const relativePaths = results.map((result) => result.relative);
      const expectedFiles = [
        'test/collateral-nested/test/evens/2.js',
        'test/collateral-nested/test/evens/42.js',
        'test/collateral-nested/test/odds/23.js',
        'test/collateral-nested/test/odds/3.js'
      ];
      sameMembers(assert, files, expectedFiles);
      const expectedRelPaths = [
        'evens/2.js',
        'evens/42.js',
        'odds/23.js',
        'odds/3.js'
      ];
      sameMembers(assert, relativePaths, expectedRelPaths);
    }).then(assert.done, assert.fail);
});
