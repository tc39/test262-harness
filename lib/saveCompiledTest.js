'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function saveCompiledTest(test, opts) {
  let passed = test.result.pass;
  let resultString = passed ? 'pass' : 'fail';
  let savedTestPath = path.normalize(test.file.replace(/\.js$/, `.js.${opts.hostType}.${resultString}`));
  fs.writeFileSync(savedTestPath, test.contents);
  return savedTestPath;
}
