/*---
description: Async test
flags: [async]
---*/

var p = new Promise(function(resolve) {
  resolve();
});

p.then($DONE, $DONE);
