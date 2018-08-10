'use strict';

const parseFile = require('test262-parser').parseFile;
const run = require('./util/run');
const tap = require('tap');

const tests = [
  [['test/**/*.js'], { cwd: 'test/collateral-with-harness/test262' }],
  [['--test262Dir', './test/collateral-with-harness/test262', 'test/collateral-with-harness/test262/test/**/*.js']],
  [['--test262Dir', './test/collateral-with-harness/test262', 'test/collateral-with-harness/test262/test/**/*.js', 'test/collateral-with-harness/loose-tests/*']],
  [['--test262Dir', './collateral-with-harness/test262', 'collateral-with-harness/test262/test/**/*.js'], { cwd: 'test' }],
  [['--includesDir', './test/test-includes', 'test/collateral/test/**/*.js']],
  [['test/collateral-with-harness/test262/test/**/*.js']],
  [['--includesDir', './test-includes', 'collateral/test/**/*.js'], { cwd: 'test' }],
  [['collateral-with-harness/test262/test/**/*.js'], { cwd: 'test' }],
  [['--includesDir', './test/test-includes', '--prelude', './test/fixtures/prelude-a.js',  '--prelude', './test/fixtures/prelude-b.js', 'test/collateral/test/bothStrict.js'], { prelude: true }],
  [['--includesDir', './test/test-includes', '--reporter-keys', 'attrs,result', 'test/collateral/test/bothStrict.js'], { noRawResult: true }],
  [['--includesDir', './test/test-includes', '--reporter-keys', 'rawResult,attrs,result', 'test/collateral/test/bothStrict.js']],
  [['--includesDir', './test/test-includes', '--reporter-keys', 'attrs,rawResult,result', 'test/collateral/test/bothStrict.js']],
  [['--includesDir', './test/test-includes', '--reporter-keys', 'attrs,result,rawResult', 'test/collateral/test/bothStrict.js']],
   [['--includesDir', './test/test-includes', '--babelPresets', 'stage-3', '--reporter-keys', 'attrs,result,rawResult', 'test/babel-collateral/test/spread-sngl-obj-ident.js']],
];

Promise.all(tests.map(args => run(...args).then(validate)))
  .catch(reportRunError);

function reportRunError(error) {
  console.error('Error running tests');
  console.error(error.stack);
  process.exit(1);
}

function validate({ records, options = { prelude: false } }) {
  records.forEach(record => {

    const description = options.prelude ?
      `${record.attrs.description} with prelude` :
      record.attrs.description;

    tap.test(description, assert => {

      if (typeof record.scenario !== 'undefined') {
        if (record.contents.startsWith('"use strict"')) {
          assert.equal(record.scenario, 'strict mode');
        } else {
          assert.equal(record.scenario, 'default');
        }
      }

      assert.notEqual(record.attrs.expected, undefined, 'Test has an "expected" frontmatter');
      if (!record.attrs.expected) {
        // can't do anything else
        assert.end();
        return;
      }

      assert.equal(record.result.pass, record.attrs.expected.pass, 'Test passes or fails as expected');

      if (record.attrs.expected.message) {
        assert.equal(record.result.message, record.attrs.expected.message, 'Test fails with appropriate message');
      }

      if (options.prelude) {
        assert.ok(record.rawResult.stdout.includes('prelude a!'), 'Has prelude-a content');
        assert.ok(record.rawResult.stdout.includes('prelude b!'), 'Has prelude-b content');
      }

      if (options.noRawResult) {
        assert.equal(record.rawResult, undefined);
      } else {
        assert.equal(typeof record.rawResult, 'object');
      }

      assert.end();
    });
  });
}
