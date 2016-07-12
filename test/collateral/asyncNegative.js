/*---
description: Async test
negative: RangeError
expected:
  pass: true
---*/

process.nextTick(function() {
    $DONE(new RangeError());
});
