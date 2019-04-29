'use strict';

const run = require('./util/run');
const tap = require('tap');
const reporter = 'json';

tap.test('unsupported version without `acceptVersion`', assert => {
  run(['test/collateral-unsupported-version/test/**/*.js'], {reporter})
    .catch(assert.fail)
    .then(assert.done);
});

tap.test('supported version with matching `acceptVersion`', assert => {
  run(['test/collateral-supported-version/test/**/*.js',  '--acceptVersion', '4.0.0'], {reporter})
    .catch(assert.fail)
    .then(assert.done);
});

tap.test('supported version with non-matching `acceptVersion`', assert => {
  run(['test/collateral-supported-version/test/**/*.js',  '--acceptVersion', '99.0.0'], {reporter})
    .catch(assert.fail)
    .then(assert.done);
});

tap.test('unsupported version with matching `acceptVersion`', assert => {
  run(['test/collateral-unsupported-version/test/**/*.js',  '--acceptVersion', '99.0.0'], {reporter})
    .catch(assert.fail)
    .then(assert.done);
});

tap.test('unsupported version with non-matching `acceptVersion`', assert => {
  run(['test/collateral-unsupported-version/test/**/*.js',  '--acceptVersion', '98.0.0'], {reporter})
    .then(() => {
      assert.fail('Expected command to fail, but it succeeded.');
    }, () => {})
    .then(assert.done);
});
