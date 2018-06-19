'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function saveCompiledTest(test, options) {
  let outcome = test.result.pass ? 'pass' : 'fail';
  let savedTestPath = path.normalize(`${test.file}.${options.hostType}.${outcome}`);
  fs.writeFileSync(savedTestPath, test.contents);
  return savedTestPath;
}
