'use strict';
const util = require('util');

module.exports = scenariosForTest;
function scenariosForTest(test) {
  if(!test.attrs.flags.onlyStrict && !test.attrs.flags.noStrict && !test.attrs.flags.raw) {
    test.strictMode = false;

    var copy = util._extend({}, test);
    copy.attrs = util._extend({}, test.attrs);
    copy.attrs.description += ' (Strict Mode)'
    copy.contents = '"use strict";\n' + copy.contents;
    // test both modes
    return [test, copy];
  } else {
    return [test];
  }
}

