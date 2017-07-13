'use strict';
const pick = require('../pick');

function jsonReporter(results, opts) {
  let started = false;

  results.on('start', function () {
    console.log('[');
  });

  results.on('end', function () { 
    console.log(']');
  });

  results.on('test end', function (test) {
    let toEmit;

    if (started) {
      process.stdout.write(',');
    } else {
      started = true;
    }

    if (opts.reporterKeys) {
      toEmit = pick(test, opts.reporterKeys);
    } else {
      toEmit = test;
    }

    console.log(JSON.stringify(toEmit));
  });
}

module.exports = jsonReporter;
