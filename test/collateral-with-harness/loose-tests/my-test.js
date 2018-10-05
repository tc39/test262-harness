/*---
description: Should use harness files in local Test262 project
info: >
  This test represents the use case of ECMAScript language proposals. These
  projects may include Test262 tests prior to their introduction to the Test262
  repository.

  Like the example in the `test262` directory, this test signals correct
  behavior by throwing an EvalError to avoid false positives in cases where the
  source text is not evaluated.
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
