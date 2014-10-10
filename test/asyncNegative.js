/*---
description: Async test
negative: RangeError
---*/

Promise.resolve().then(function() {
    $DONE(new RangeError());
})
