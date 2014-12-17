/*---
description: Async test
negative: RangeError
---*/

process.nextTick(function() {
    $DONE(new RangeError());
});
