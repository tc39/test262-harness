/*---
description: Test requiring transpilation
expected:
  pass: true
---*/

let o = {c: 3, d: 4};

let callCount = 0;

(function(obj) {
  assert.sameValue(obj.c, 3);
  assert.sameValue(obj.d, 4);
  assert.sameValue(Object.keys(obj).length, 2);
  callCount += 1;
}({...o}));

assert.sameValue(callCount, 1);
