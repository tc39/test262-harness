/*---
description: Async negative test
negative:
  phase: runtime
  type: RangeError
expected:
  pass: true
flags: [async]
---*/

setTimeout(function() {
  $DONE(new RangeError());
}, 1000);
