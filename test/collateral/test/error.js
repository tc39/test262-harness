/*---
description: Fails by calling $ERROR
expected:
  pass: false
  message: failure message
features: [C]
---*/

$ERROR('failure message');
