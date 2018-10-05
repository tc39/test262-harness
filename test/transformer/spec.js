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

module.exports = function(code) {
  return babel.transform(code, options).code;
};
