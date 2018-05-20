/*---
description: Should not test in sloppy mode
flags: [onlyStrict]
negative:
  phase: runtime
  type: ReferenceError
expected:
  pass: true
---*/
x = 5;
$ERROR('Not in strict mode');
