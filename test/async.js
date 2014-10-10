/*---
description: Async test
note: Will only work in hosts with setTimeout...
---*/

Promise.resolve().then(function() {
    $DONE()
})
