'use strict';

const fs = require('fs');
const Path = require('path');

module.exports = function findTest262Dir(globber) {
  const set = globber.minimatch.set;
  let baseDir;
  for (let i = 0; i < set.length; i++) {
    let base = [];

    for (let j = 0; j < set[i].length; j++) {
      if (typeof set[i][j] !== 'string') {
        break;
      }

      base.push(set[i][j]);
    }

    baseDir = findTest262Root(base.join("/"));

    if (baseDir) {
      break;
    }
  }

  return baseDir;
};

function findTest262Root(path) {
  const stat = fs.statSync(path);
  if (stat.isFile()) {
    path = Path.dirname(path);
  }

  const contents = fs.readdirSync(path)
  if (contents.indexOf('README.md') > -1
      && contents.indexOf('package.json') > -1
      && contents.indexOf('test') > -1
      && contents.indexOf('harness') > -1) {
    return path;
  }

  const parent = Path.resolve(path, '../');

  if (parent === path) {
    return null;
  }

  return findTest262Root(parent);
}
