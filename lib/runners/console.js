// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = ConsoleRunner;

var Runner = require('../runner');
var fs = require('fs');
var cp = require('child_process');
var counter = 0;

function ConsoleRunner(args) {
    this.command = args.consoleCommand;
    this.printCommand = args.consolePrintCommand;
    this.errorImpl = ';function $ERROR(str) { ' + this.printCommand + '("> ERROR: " + str)}'
    if(!this.command) throw "--consoleCommand option required for console runner";
    Runner.apply(this, arguments);
}
ConsoleRunner.prototype = Object.create(Runner.prototype);
ConsoleRunner.prototype.run = function(test, cb) {
    var file = '$tmp' + counter++ + '.js';

    var command = this.command + ' ' + file;

    fs.writeFile(file, test.contents + this.errorImpl, function(err) {
        cp.exec(command, function(err, stdout, stderr) {
            fs.unlink(file);
            var match;

            if(stderr) {
                var match = stderr.match(/^(\w+): (.*)$/m);
                if(match) {
                    cb(match[1] + ": " + match[2]);
                } else {
                    cb(stderr);
                }
            } else {
                match = stdout.match(/> ERROR: (.*)$/m);
                if(match) {
                    cb(match[1]);
                } else {
                    cb(null);
                }
            }
        });
    }); 
}
