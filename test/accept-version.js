const tap = require('tap');

const run = require('./util/run');

tap.test('unsupported version without `acceptVersion`', (test) => {
  run(['test/collateral-unsupported-version/test/**/*.js'])
    .then(() => {
      test.fail('Expected command to fail, but it succeeded.');
    }, () => {})
    .then(test.done);
});

tap.test('supported version with matching `acceptVersion`', (test) => {
  run(['test/collateral-supported-version/test/**/*.js',  '--acceptVersion', '3.0.0'])
    .catch(test.fail)
    .then(test.done);
});

tap.test('supported version with non-matching `acceptVersion`', (test) => {
  run(['test/collateral-supported-version/test/**/*.js',  '--acceptVersion', '99.0.0'])
    .then(() => {
      test.fail('Expected command to fail, but it succeeded.');
    }, () => {})
    .then(test.done);
});

tap.test('unsupported version with matching `acceptVersion`', (test) => {
  run(['test/collateral-unsupported-version/test/**/*.js',  '--acceptVersion', '99.0.0'])
    .catch(test.fail)
    .then(test.done);
});

tap.test('unsupported version with non-matching `acceptVersion`', (test) => {
  run(['test/collateral-unsupported-version/test/**/*.js',  '--acceptVersion', '98.0.0'])
    .then(() => {
      test.fail('Expected command to fail, but it succeeded.');
    }, () => {})
    .then(test.done);
});
