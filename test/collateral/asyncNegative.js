/*---
description: Async test
negative:
  phase: runtime
  type: RangeError
expected:
  pass: true
---*/

setTimeout(function() {
  $DONE(new RangeError());
}, 1000);
