'use strict';

const EventEmitter = require('events');

function resultsEmitter(results) {
  const emitter = new EventEmitter();
  emitter.emit('start');
  results.forEach(
    function (test) {
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
