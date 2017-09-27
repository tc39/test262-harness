'use strict';

module.exports = function scenariosForTest(test) {
  // The `test262-compiler` project inserts a global "use strict" directive for
  // tests marked with the `onlyStrict` flag. While this obviates the need for
  // additional transformations to the source, the `scenario` metadata must
  // still be set accordingly.
  test.scenario = test.attrs.flags.onlyStrict ? 'strict mode' : 'default';

  if (!test.attrs.flags.onlyStrict &&
      !test.attrs.flags.noStrict &&
      !test.attrs.flags.raw) {

    test.strictMode = false;

    const copy = Object.assign({}, test);
    copy.attrs = Object.assign({}, test.attrs);
    copy.attrs.description += ' (Strict Mode)'
    copy.contents = `"use strict";\n${copy.contents}`;
    copy.scenario = 'strict mode';
    // test both modes
    return [test, copy];
  } else {
    return [test];
  }
};

