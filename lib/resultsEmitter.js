'use strict';

const EventEmitter = require('events');

function resultsEmitter(results) {
  let started = false;
  const emitter = new EventEmitter();
  results.forEach(
    function (test) {
      if (!started) {
        emitter.emit('start');
        started = true;
      }

      emitter.emit('test end', test);

      if (test.result.pass) {
        emitter.emit('pass', test);
      } else {
        emitter.emit('fail', test);
      }
    },
    function (err) {
      console.error("ERROR", err);
    },
    function () {
      emitter.emit('end')
    });

  return emitter;
}

module.exports = resultsEmitter;
