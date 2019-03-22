const babel = require("@babel/core");
const options = {
  cwd: __dirname,
  presets: [
    [
      "@babel/preset-env",
      {
        spec: true
      }
    ]
  ]
};

class Test262Fake extends Error {}

module.exports = function(test) {
  test.result = {
    stderr: 'This is a fake test.',
    stdout: '',
    error: {
      name: 'Test262Error',
      message: 'Test262Fake: This is a fake test.'
    }
  };

  return test;
};
