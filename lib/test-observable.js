'use strict';

const fs = require('fs');
const path = require('path');
const Rx = require('rx');
const compile = require('test262-compiler');
const util = require('util');

const fixturePattern = /_FIXTURE\.[jJ][sS]$/;
const scenariosForTest = require('./scenarios.js');

module.exports = function(test262Dir, options = {}) {
  const prelude = options.prelude || '';
  const includesDir = options.includesDir;
  const absolutePaths = (options.paths || ['test'])
    .map(relativePath => path.join(test262Dir, relativePath));

  return absolutePaths
    .map(findFiles)
    .reduce((accumulator, moreFiles) => accumulator.merge(moreFiles))
    .map(path => pathToTestFile(path, test262Dir))
    .map(test => compileFile(test, test262Dir, prelude, includesDir))
    .flatMap(scenariosForTest);
};

function pathToTestFile(absolutePath, test262Dir) {
  const relativePath = path.relative(test262Dir, absolutePath);
  const contents = fs.readFileSync(absolutePath, 'utf-8');
  return { file: relativePath, contents };
}

function compileFile(test, test262Dir, prelude, includesDir) {
  const endFrontmatterRe = /---\*\/\r?\n/g;
  const match = endFrontmatterRe.exec(test.contents);
  if (match) {
    test.contents = test.contents.slice(0, endFrontmatterRe.lastIndex)
                    + prelude
                    + test.contents.slice(endFrontmatterRe.lastIndex);
  } else {
    test.contents = prelude + test.contents;
  }
  return compile(test, { test262Dir, includesDir });
}

function findFiles(targetPath, includeHidden) {
  const files = new Rx.Subject();

  fs.exists(targetPath, (exists) => {
    if (!exists) {
      files.onError(new Error('Path does not exist: "' + targetPath + '"'));
      files.onCompleted();
      return;
    }

    fs.stat(targetPath, (err, stat) => {
      if (err) {
        files.onError(err);
        files.onCompleted();
        return;
      }

      if (stat.isFile()) {
        if (!fixturePattern.test(targetPath) &&
          (includeHidden || path.basename(targetPath)[0] !== '.')) {
          files.onNext(Rx.Observable.just(targetPath));
        }

        files.onCompleted();
        return;
      }

      fs.readdir(targetPath, (err, contents) => {
        if (err) {
          files.onError(err);
          files.onCompleted();
          return;
        }

        contents.forEach(childPath =>
          files.onNext(findFiles(path.join(targetPath, childPath)))
        );

        files.onCompleted();
      });
    });
  });
  return files.mergeAll();
}
