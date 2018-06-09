/*---
description: Should use harness files in local Test262 project
info: >
  This test signals correct behavior by throwing an EvalError to avoid false
  positives in cases where the source text is not evaluated.
flags: [onlyStrict]
expected:
  pass: true
includes: [custom-include.js]
negative:
  phase: runtime
  type: EvalError
---*/

if (typeof fromAssert === 'boolean' && typeof fromIncludeFile === 'boolean') {
  throw new EvalError();
}
