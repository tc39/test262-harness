'use strict';

module.exports = function(obj, keys) {
  let picked = {};

  keys.forEach(function(key) {
      picked[key] = obj[key];
    });

  return picked;
};
