// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = JSShellRunner;

var fs = require('fs');
var cp = require('child_process');
var ConsoleRunner = require('./console');
var counter = 0;

function JSShellRunner(args) {
    args.consolePrintCommand = args.consolePrintCommand || "print";

    ConsoleRunner.apply(this, arguments);
}

JSShellRunner.prototype = Object.create(ConsoleRunner.prototype);
JSShellRunner.prototype._createEnv = 'newGlobal()';
JSShellRunner.prototype._runBatched = 'env.evaluate(test);'
