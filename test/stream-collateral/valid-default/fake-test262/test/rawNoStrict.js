/*---
description: Should not test in strict mode
flags: [raw]
---*/
var seemsStrict;
try {
  x = 1;
} catch (err) {
  seemsStrict = err.constructor === ReferenceError;
}

if (seemsStrict) {
  throw new Error('Script erroneously interpreted in strict mode.');
}
