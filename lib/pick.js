'use strict';

module.exports = function(obj, keys) {
  return keys.reduce((accum, key) => {
    accum[key] = obj[key];
    return accum;
  }, {});
};
