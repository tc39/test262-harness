'use strict';
const {Glob} = require('glob');
const Rx = require('rx');

module.exports = function globber(paths, options = {}) {
  const {ignore} = options;
  const files = new Rx.Subject();
  files.fileEvents = [];

  let doneCount = 0;

  // paths.filter(path => !path.endsWith('_FIXTURE.js')).forEach(path => {
  paths.forEach(path => {
    const glob = new Glob(path, {
      nodir: true,
      ignore,
    });

    glob.on('match', file => files.onNext(file));
    glob.on('end', () => {
      if (++doneCount === paths.length) {
        files.onCompleted();
      }
    });

    files.fileEvents.push(glob);
  });

  return files;
};
