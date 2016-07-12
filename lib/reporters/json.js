'use strict';

function jsonReporter(results) {
  let started = false;

  results.on('start', function () {
    console.log('[');
  });

  results.on('end', function () { 
    console.log(']');
  });

  results.on('test end', function (test) {
    if (started) {
      process.stdout.write(',');
    } else {
      started = true;
    }

    console.log(JSON.stringify(test));
  });
}

module.exports = jsonReporter;
