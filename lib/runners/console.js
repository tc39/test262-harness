// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = ConsoleRunner;

var Runner = require('../runner');
var fs = require('fs');
var cp = require('child_process');
var counter = 0;

var doneFn = function $DONE(err) {
    if(err) $ERROR(err);
    $LOG('test262/done');
}.toString()

var errorFn = function $ERROR(err) {
    if(typeof err === "object" && err !== null && "name" in err)
        $LOG("test262/error " + err.name + ": " + err.message)
    else $LOG("test262/error Error: " + err);
}.toString()

function ConsoleRunner(args) {
    this.command = args.consoleCommand;
    this.printCommand = args.consolePrintCommand || "console.log";
    this.deps = [
        doneFn,
        errorFn,
        'function $LOG(str) { ' + this._print('str') + '}',
    ]
    if(!this.command) throw "--consoleCommand option required for console runner";

    Runner.apply(this, arguments);
}
ConsoleRunner.prototype = Object.create(Runner.prototype);
ConsoleRunner.prototype._print = function(str) {
    return this.printCommand + '(' + str + ');\n';
}

ConsoleRunner.prototype.execute = function(test, cb) {
    var runner = this;
    var file = '__tmp' + counter++ + '.js';

    var command = this.command + ' ' + file;

    fs.writeFile(file, test.contents, function(err) {
        cp.exec(command, function(err, stdout, stderr) {
            fs.unlink(file);
            var match;
            var result = {
                log: stdout.split(/\r?\n/),
                errorString: stderr
            }

            runner.validateResult(test, result);

            cb();
        });
    }); 
}

