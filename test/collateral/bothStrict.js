/*---
description: Should test in both modes
negative:
  phase: runtime
  type: ReferenceError
expected:
  pass: true
---*/
var strict;
try { x = 1; strict = false;} catch(e) { strict = true }

if(strict) {
    y = 1;
} else {
    throw new ReferenceError();
}
