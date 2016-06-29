'use strict';
const glob = require('glob');
const Rx = require('rx');

function globber(g) {
  const Glob = glob.Glob;
  const fileEvents = new Glob(g);
  const paths = new Rx.Subject();

  fileEvents.on('match', function (file) {
    paths.onNext(file);
  });

  fileEvents.on('end', function () {
    paths.onCompleted();
  })

  paths.fileEvents = fileEvents;
  return paths;
}

module.exports = globber;
