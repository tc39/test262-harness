'use strict';

const tap = require('tap');
const _run = require('./util/run');

const reporter = 'json';
function run(...args) {
  return _run([
    ...args,
    '--includesDir',
    './test/test-includes',
    './test/collateral-nested/test/**/*.js'
  ], {reporter}).then(({records}) => records);
}

tap.test('all keys', assert => {
  run()
    .then(results => {
      const expectedKeys = [
        'file', 'result', 'contents', 'attrs', 'copyright', 'scenario',
        'rawResult', 'compiled'
      ];
      for (const result of results) {
        for (const key of expectedKeys) {
          assert.assert(result.hasOwnProperty(key), `${result} has '${key}' property`);
        }
      }
    }).then(assert.done, assert.fail);
});

tap.test('selected single key', assert => {
  run('--reporter-keys=file')
    .then(results => {
      for (const result of results) {
        assert.assert(result.hasOwnProperty('file'), `${result} has 'file' property`);
        assert.equal(Object.keys(result).length, 1);
      }
    }).then(assert.done, assert.fail);
});

tap.test('selected multiple keys', assert => {
  run('--reporter-keys=attrs,scenario')
    .then(results => {
      for (const result of results) {
        assert.assert(result.hasOwnProperty('attrs'), `${result} has 'attrs' property`);
        assert.assert(result.hasOwnProperty('scenario'), `${result} has 'scenario' property`);
        assert.equal(Object.keys(result).length, 2);
      }
    }).then(assert.done, assert.fail);
});

tap.test('selected single complex key', assert => {
  run('--reporter-keys=attrs.description')
    .then(results => {
      for (const result of results) {
        assert.assert(result.hasOwnProperty('attrs'), `${result} has 'attrs' property`);
        assert.equal(Object.keys(result).length, 1);

        assert.assert(
          result.attrs.hasOwnProperty('description'),
          `${result}.attrs has 'description' property`
        );
        assert.equal(Object.keys(result.attrs).length, 1);
      }
    }).then(assert.done, assert.fail);
});

tap.test('selected multiple complex keys', assert => {
  run('--reporter-keys=attrs.description,attrs.includes,rawResult.error')
    .then(results => {
      for (const result of results) {
        assert.assert(result.hasOwnProperty('attrs'), `${result} has 'attrs' property`);
        assert.assert(result.hasOwnProperty('rawResult'), `${result} has 'rawResult' property`);
        assert.equal(Object.keys(result).length, 2, 'selects only two parent keys');

        assert.assert(
          result.attrs.hasOwnProperty('description'),
          `${result}.attrs has 'description' property`
        );

        assert.assert(
          result.attrs.hasOwnProperty('includes'),
          `${result}.attrs has 'includes' property`
        );

        assert.equal(
          Object.keys(result.attrs).length, 2,
          'selects two parent keys from the attrs property'
        );

        assert.assert(
          result.rawResult.hasOwnProperty('error'),
          `${result}.rawResult has 'error' property`
        );

        assert.equal(
          Object.keys(result.rawResult).length, 1,
          'selects only one property from rawResult'
        );
      }
    }).then(assert.done, assert.fail);
});
