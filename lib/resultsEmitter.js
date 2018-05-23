'use strict';

const EventEmitter = require('events');

module.exports = function resultsEmitter(results) {
  let started = false;
  const emitter = new EventEmitter();
  results.forEach(
    (test) => {
      if (!started) {
        emitter.emit('start');
        started = true;
      }

      if (test.result.pass) {
        emitter.emit('pass', test);
      } else {
        emitter.emit('fail', test);
      }

      emitter.emit('test end', test);
    },
    (error) => {
      console.error("ERROR", error);
    },
    () => {
      emitter.emit('end')
    });

  return emitter;
};
