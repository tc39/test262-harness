'use strict';

const fs = require('fs');
const path = require('path');
const parseFile = require('test262-parser').parseFile;

module.exports = function compile(test, options) {
  options = options || {};
  if (!options.test262Dir && !options.includesDir) {
    throw new Error('Need one of test262Dir or includesDir options');
  }

  if (options.test262Dir && !options.includesDir) {
    options.includesDir = path.join(options.test262Dir, 'harness');
  }

  test = parseFile(test);

  // The following properties are defined by the `test262-parser` module. They
  // are removed here because they are inconsistent and could therefore cause
  // confusion.
  delete test.isATest;
  delete test.async;
  delete test.strictMode;

  test.scenario = null;

  if (test.attrs.flags.raw || options.omitRuntime) {
    test.insertionIndex = test.attrs.flags.raw ? -1 : 0;
    return test;
  }

  const helpers = test.attrs.includes;
  helpers.push('assert.js');
  helpers.push('sta.js');

  if (test.attrs.flags.async) {
    helpers.push('doneprintHandle.js');
  }

  let preludeContents = '';
  for (let i = 0; i < helpers.length; i++) {
    preludeContents += fs.readFileSync(
      path.join(options.includesDir, helpers[i])
    );
    preludeContents += '\n';
  }

  test.contents = preludeContents + test.contents;
  test.insertionIndex = preludeContents.length + 1;

  return test;
};
