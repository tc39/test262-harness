'use strict';
const glob = require('glob');
const Rx = require('rx');

module.exports = function globber(paths) {
  const files = new Rx.Subject();

  let doneCount = 0;

  paths.forEach(path => {
    const fileEvents = new glob.Glob(path, {
      nodir: true
    });

    fileEvents.on('match', file => files.onNext(file));
    fileEvents.on('end', () => {
      if (++doneCount === paths.length) {
        files.onCompleted();
      }
    });
  });

  return files;
};
