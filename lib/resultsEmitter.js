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

      emitter.emit('test end', test);

      if (test.result.pass) {
        emitter.emit('pass', test);
      } else {
        emitter.emit('fail', test);
      }
    },
    (error) => {
      console.error("ERROR", error);
    },
    () => {
      emitter.emit('end')
    });

  return emitter;
};
