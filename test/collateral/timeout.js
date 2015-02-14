/*---
description: infinite loop test
negative: /imeout/
---*/

for(;;) {}

// should cause a timeout
$DONE();
