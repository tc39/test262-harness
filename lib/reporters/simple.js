'use strict';
const path = require('path');
function simpleReporter(results) {
  let passed = 0;
  let failed = 0;
  let lastPassed = true;

  results.on('pass', function (test) {
    passed++;

    clearPassed();
    lastPassed = true;
    process.stdout.write('PASS ' + test.file);
  });

  results.on('fail', function (test) {
    failed++;
    clearPassed();
    lastPassed = false;
    console.log('FAIL ' + test.file);
    console.log('  ' + test.result.message);
    console.log('');
  });

  results.on('end', function () {
    clearPassed();

    console.log('Ran ' + (passed + failed) + ' tests')
    console.log(passed + ' passed')
    console.log(failed + ' failed')
  });

  function clearPassed() {
    if (lastPassed) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }
  }
}

module.exports = simpleReporter;
