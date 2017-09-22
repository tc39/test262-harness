/*---
description: Should test in both modes
features: [var, try, if]
negative:
  phase: runtime
  type: ReferenceError
---*/
var strict;
try { x = 1; strict = false;} catch(e) { strict = true }

if(strict) {
    y = 1;
} else {
    throw new ReferenceError();
}
