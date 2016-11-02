'use strict';

function jsonReporter(results) {
  let started = false;

  results.on('start', function () {
    results.writeLine('[');
  });

  results.on('end', function () {
    results.writeLine(']');
  });

  results.on('test end', function (test) {
    if (started) {
      results.write(',');
    } else {
      started = true;
    }

    results.writeLine(JSON.stringify(test));
  });
}

module.exports = jsonReporter;
