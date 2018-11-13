'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const run = require('./util/run');
const tap = require('tap');

const sourcepattern = path.join(process.cwd(), 'test/collateral-save/test/*.js');
const resultpattern = path.join(process.cwd(), 'test/collateral-save/test/*.{fail,pass}');
const sources = glob.sync(sourcepattern);

const reporter = 'json';

tap.test('save all compiled tests with `--saveCompiledTests`', assert => {
  run(['--includesDir', './test/test-includes', sourcepattern, '--saveCompiledTests'], {reporter})
    .catch(assert.fail)
    .then(() => {
      const results = glob.sync(resultpattern);
      // sources.length * 2 scenarios = results.length
      let expected = sources.length * 2;
      // However, there are special cases:
      expected -= 1; // for noStrict.js
      expected -= 1; // for rawNoStrict.js
      expected -= 1; // for rawStrict.js
      expected -= 1; // for strict.js

      assert.equal(
        results.length, expected, 'Saves the exact number of expected files'
      );

      return Promise.all(
        results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
      );
    }).then(assert.done);
});

tap.test('save failed compiled tests with `--saveCompiledTests --saveOnlyFailed`', assert => {

  run(['--includesDir', './test/test-includes', sourcepattern, '--saveCompiledTests', '--saveOnlyFailed'], {reporter})
    .catch(assert.fail)
    .then(() => {
      const results = glob.sync(resultpattern);
      // 3 test files * 2 scenarios = 6 saved files
      assert.equal(results.length, 6, 'Expecting 6 result files.');

      return Promise.all(
        results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
      );
    }).catch(assert.fail).then(assert.done);
});

tap.test('save failed compiled tests with `--saveOnlyFailed` (implies `--saveCompiledTests`)', assert => {

  run(['--includesDir', './test/test-includes', sourcepattern, '--saveOnlyFailed'], {reporter})
    .catch(assert.fail)
    .then(() => {
      const results = glob.sync(resultpattern);
      // 3 test files * 2 scenarios = 6 saved files
      assert.equal(results.length, 6, 'Expecting 6 result files.');

      return Promise.all(
        results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
      );
    }).catch(assert.fail).then(assert.done);
});
