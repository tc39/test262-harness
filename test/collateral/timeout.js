/*---
description: infinite loop test
negative: /imeout/
---*/

if (0) {
  // causes test to be detected as async
  $DONE();
}

