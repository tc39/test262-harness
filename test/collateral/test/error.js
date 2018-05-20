/*---
description: Fails by calling $ERROR
expected:
  pass: false
  message: failure message
---*/

$ERROR('failure message');
