/*---
description: Async test
expected:
  pass: true
---*/

var p = new Promise(function(resolve) {
  resolve();
});

p.then($DONE, $DONE);
