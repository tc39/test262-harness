'use strict';

const fs = require('fs');
const Path = require('path');

module.exports = function getConditionals(path) {
  if (fs.existsSync(path)) {
    if (!fs.statSync(path).isFile()) {
      throw new Error('The conditional argument requires a valid file.');
    }
  } else {
    throw new Error('The conditional argument requires an existing file as argument.');
  }

  return fs.readFileSync(path)
      .toString()
      .split(/[\r\n]+/)
      .filter(line => line.match(/^test\/\w+/))
      .map(line => {
        // Let Windows users have a better time
        if (Path.sep !== '/') {
          return line.replace(/\//g, Path.sep);
        } else {
          return line;
        }
      });
};
