'use strict';
const usd = '"use strict";\n';
const usdLength = usd.length;

module.exports = function scenariosForTest(test) {
  const scenarios = [];

  if (!test.attrs.flags.onlyStrict) {
    test.scenario = 'default';
    scenarios.push(test);
  }

  if (!test.attrs.flags.noStrict && !test.attrs.flags.raw) {
    const copy = Object.assign({}, test);
    copy.attrs = Object.assign({}, test.attrs);
    copy.attrs.description += ' (Strict Mode)';
    copy.contents = usd + copy.contents;
    copy.insertionIndex += usdLength;
    copy.scenario = 'strict mode';
    scenarios.push(copy);
  }

  return scenarios;
};
