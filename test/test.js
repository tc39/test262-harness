'use strict';

const tap = require('tap');

const parseFile = require('test262-parser').parseFile;
const run = require('./util/run');

const tests = [
  [['test/**/*.js'], { cwd: 'test/collateral-with-harness/test262' }],
  [['--test262Dir', './test/collateral-with-harness/test262', 'test/collateral-with-harness/test262/test/**/*.js']],
  [['--test262Dir', './test/collateral-with-harness/test262', 'test/collateral-with-harness/test262/test/**/*.js', 'test/collateral-with-harness/loose-tests/*']],
  [['--test262Dir', './collateral-with-harness/test262', 'collateral-with-harness/test262/test/**/*.js'], { cwd: 'test' }],
  [['--includesDir', './test/test-includes', 'test/collateral/test/**/*.js']],
  [['test/collateral-with-harness/test262/test/**/*.js']],
  [['--includesDir', './test-includes', 'collateral/test/**/*.js'], { cwd: 'test' }],
  [['collateral-with-harness/test262/test/**/*.js'], { cwd: 'test' }],
  [['--includesDir', './test/test-includes', '--prelude', './test/fixtures/prelude.js', 'test/collateral/test/bothStrict.js'], { prelude: true }],
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

    tap.test(description, test => {

      if (typeof record.scenario !== 'undefined') {
        if (record.contents.startsWith('"use strict"')) {
          test.equal(record.scenario, 'strict mode');
        } else {
          test.equal(record.scenario, 'default');
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
        test.assert(record.rawResult.stdout.indexOf('prelude!') > -1, 'Has prelude content');
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
