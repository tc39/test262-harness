'use strict';

const EventEmitter = require('events');
const fs = require('fs');

function resultsEmitter(results, argv) {
  let started = false;
  const emitter = new EventEmitter();

  if (argv.output) {
    emitter.output = fs.createWriteStream(argv.output);
  }

  emitter.write = function() {
    emitter.writeStdout.apply(this, arguments);
    emitter.writeLog.apply(this, arguments);
  };

  emitter.writeLine = function() {
    emitter.write.apply(this, arguments);
    emitter.write("\n");
  };

  emitter.writeLog = function() {
    if (!emitter.output) {
      return;
    }
    for (let i = 0; i < arguments.length; i++) {
      emitter.output.write(arguments[i]);
    }
  };

  emitter.writeLogLine = function() {
    emitter.writeLog.apply(this, arguments);
    emitter.writeLog("\n");
  };

  emitter.writeStdout = function() {
    if (argv.quiet) {
      return;
    }
    for (let i = 0; i < arguments.length; i++) {
      process.stdout.write(arguments[i]);
    }
  };

  emitter.writeStdoutLine = function() {
    emitter.writeStdout.apply(this, arguments);
    emitter.writeStdout("\n");
  };

  emitter.isQuiet = function() {
      return argv.quiet;
  };

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
      emitter.emit('end');
    });

  return emitter;
}

module.exports = resultsEmitter;
