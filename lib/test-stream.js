'use strict';

const path = require('path');

const Rx = require('rx');
const Test262Stream = require('test262-stream');
const minimatch = require('minimatch');

// test262-harness accepts file names and patterns as input; test262-stream
// accepts file names and directory names. To accomodate this, file patterns
// containing globs are truncated to the most precise directory name. All files
// within this directory are visited by test262-stream, but only those tests
// which match the pattern are emitted to from this module.
function patternsToDirectories(patterns) {
  return patterns.map((pattern) => {
    const parts = [];

    pattern.split(path.sep).every((part) => {
      if (part.indexOf('*') > -1 || part.slice(-3).toLowerCase() === '.js') {
        return false;
      }

      parts.push(part);

      return true;
    });

    return parts.join(path.sep);
  }).filter((name) => name !== '');
}

module.exports = function(test262Dir, includesDir, acceptVersion, globPatterns) {
  const paths = patternsToDirectories(globPatterns);
  const stream = new Test262Stream(test262Dir, {
    includesDir, paths, acceptVersion
  });
  const subject = new Rx.Subject();

  stream.on('data', (test) => {
    if (!globPatterns.some((pattern) => minimatch(test.file, pattern))) {
      return;
    }

    // The file paths emitted by test262-stream are relative to the provided
    // Test262 directory. To ensure backwards compatability, they must be
    // modified to be in terms of the current working directory.
    test.file = path.relative(process.cwd(), path.join(test262Dir, test.file));

    subject.onNext(test);
  });
  stream.on('error', (error) => subject.onError(error));
  stream.on('end', () => subject.onCompleted());

  return subject;
};
