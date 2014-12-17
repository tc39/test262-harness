/*---
description: Async test
note: Will only work in hosts with setTimeout...
---*/

process.nextTick(function() {
    $DONE()
})
