/*---
description: Fails by calling $ERROR
negative:
  phase: runtime
  type: Test262Error
---*/

$ERROR('failure message');
