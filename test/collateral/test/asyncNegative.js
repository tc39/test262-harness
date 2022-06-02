/*---
description: Async negative test
negative:
  phase: runtime
  type: RangeError
expected:
  pass: true
features: [A,B]
flags: [async]
---*/

setTimeout(function() {
  $DONE(new RangeError());
}, 1000);
