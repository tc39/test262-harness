/*---
description: Fails by throwing an error
expected:
  pass: false
  message: "Expected no error, got Error: failure message"
---*/

function foo() {
    throw new Error('failure message');
}

foo();
