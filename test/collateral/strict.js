/*---
description: Should not test in sloppy mode
flags: [onlyStrict]
negative: ReferenceError
---*/
x = 5;
$ERROR('Not in strict mode');
