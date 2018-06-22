'use strict';

const fs = require('fs');
const path = require('path');
const parseFile = require('test262-parser').parseFile;

const cachedHelpers = {};

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

  const includes = test.attrs.includes;
  includes.push('assert.js');
  includes.push('sta.js');

  if (test.attrs.flags.async) {
    includes.push('doneprintHandle.js');
  }

  let preludeContents = '';

  for (let helper of includes) {
    helper = path.join(options.includesDir, helper);

    if (!cachedHelpers[helper]) {
      cachedHelpers[helper] = fs.readFileSync(helper, 'utf8');
    }

    preludeContents += `${cachedHelpers[helper]}\n`;
  }

  test.contents = preludeContents + test.contents;
  test.insertionIndex = preludeContents.length + 1;

  return test;
};
