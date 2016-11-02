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
    results.writeStdout('PASS ' + test.file);
  });

  results.on('fail', function (test) {
    failed++;
    clearPassed();
    lastPassed = false;
    results.writeLine('FAIL ' + test.file);
    results.writeLine('  ' + test.result.message);
    results.writeLine('');
  });

  results.on('end', function () {
    clearPassed();

    results.writeLine('Ran ' + (passed + failed) + ' tests')
    results.writeLine(passed + ' passed')
    results.writeLine(failed + ' failed')
  });

  function clearPassed() {
    if (lastPassed && !results.isQuiet()) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }
  }
}

module.exports = simpleReporter;
