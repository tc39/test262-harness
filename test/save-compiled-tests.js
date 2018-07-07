const fs = require('fs');
const path = require('path');

const tap = require('tap');
const glob = require('glob');

const run = require('./util/run');

tap.test('saving compiled tests', assert => {
  const sourcepattern = path.join(process.cwd(), 'test/collateral-save/test/*.js');
  const resultpattern = path.join(process.cwd(), 'test/collateral-save/test/*.{fail,pass}');

  const sources = glob.sync(sourcepattern);

  tap.test('save all compiled tests with `--saveCompiledTests`', assert => {
    run([sourcepattern, '--saveCompiledTests'])
      .catch(assert.fail)
      .then(() => {
        const results = glob.sync(resultpattern);
        assert.equal(results.length, sources.length, 'Expecting an equal number of result files to source files.');

        return Promise.all(
          results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
        );
      }).then(assert.done);
  });

  tap.test('save failed compiled tests with `--saveCompiledTests --saveOnlyFailed`', assert => {

    run([sourcepattern, '--saveCompiledTests', '--saveOnlyFailed'])
      .catch(assert.fail)
      .then(() => {
        const results = glob.sync(resultpattern);
        assert.equal(results.length, 3, 'Expecting 3 result files.');

        return Promise.all(
          results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
        );
      }).catch(error => console.log(error)).then(assert.done);
  });

  tap.test('save failed compiled tests with `--saveOnlyFailed` (implies `--saveCompiledTests`)', assert => {

    run([sourcepattern, '--saveOnlyFailed'])
      .catch(assert.fail)
      .then(() => {
        const results = glob.sync(resultpattern);
        assert.equal(results.length, 3, 'Expecting 3 result files.');

        return Promise.all(
          results.map(result => new Promise(resolve => fs.unlink(result, () => resolve())))
        );
      }).catch(error => console.log(error)).then(assert.done);
  });

  assert.done();
});
