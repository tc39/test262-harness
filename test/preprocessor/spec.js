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

module.exports = function(test) {
  try {
    test.contents = babel.transform(test.contents, options).code;
  } catch (error) {
    test.result = {
      stderr: error.toString(),
      stdout: '',
      error: null
    };
  }

  return test;
};
