'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function saveCompiledTest(test, opts) {
  let savedTestPath = path.normalize(test.file.replace(/\.js$/, `.${opts.hostType}.js`));
  fs.writeFileSync(savedTestPath, test.contents);
  return savedTestPath;
}
