// Copyright 2009 the Sputnik authors.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
function Test262Error(message) {
    this.name = "Test262Error";
    if (message) this.message = message;
}

Test262Error.prototype.toString = function () {
    return "Test262Error: " + this.message;
};
