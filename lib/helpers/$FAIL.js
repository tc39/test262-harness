/*---
includes: [Test262Error.js]
---*/
function testFailed(message) {
    throw new Test262Error(message);
}

function $FAIL(message) {
    testFailed(message);
}
