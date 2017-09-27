/*---
description: Async negative test
negative:
  phase: runtime
  type: RangeError
flags: [async]
---*/

setTimeout(function() {
  $DONE(new RangeError());
}, 1000);
