// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = JSShellRunner;

var fs = require('fs');
var cp = require('child_process');
var through = require('through');
var ConsoleRunner = require('./console');
var DEFAULT_BATCH_SIZE = 75;
var counter = 0;

function lineSplitter() {
    var splitLines = through(function(data) {
        this.buffer += data;
        var lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop();

        lines.forEach(function(line) { this.queue(line)}, this);
    }, function() {
        this.queue(this.buffer);
    })

    splitLines.buffer = "";

    return splitLines;
}

function JSShellRunner(args) {
    args.consolePrintCommand = args.consolePrintCommand || "print";

    ConsoleRunner.apply(this, arguments);

    if(args.batch === true) args.batch = DEFAULT_BATCH_SIZE;

    if(args.batch) {
        this.batchTestStart =
            'var env = newGlobal();\n' +
            'try {\n';

        this.batchTestEnd =
            '} catch(e) {\n' +
                'if(e.hasOwnProperty("name")) ' + 
                    this._print('"test262/error " + e.name + " " + e.message') + 
                'else ' + this._print('"test262/error " + e') + 
            '}\n';
    }

}

JSShellRunner.prototype = Object.create(ConsoleRunner.prototype);

JSShellRunner.prototype.executeBatch = function(batch, batchDone) {
    var runner = this;
    var baseFile = '__tmp' + counter++ + '_';
    var script = '';

    // write test files to disk
    batch.forEach(function(test, i) {
        script += this._print('"test262/test-start"')
               + this.batchTestStart
               + 'env.evaluate(' + JSON.stringify(test.contents) + ');\n'
               + this.batchTestEnd
               + this._print('"test262/test-end"');
    }, this);

    var scriptFile = baseFile + 'main.js';

    fs.writeFileSync(scriptFile, script);

    cp.exec(this.command + " " + scriptFile, function(err, stdout, stderr) {
        var results = { log: [] };
        var lines = stdout.split(/\r?\n/);
        var index = 0;

        lines.forEach(function(line) {
            switch(line) {
                case 'test262/test-start':
                    break;
                case 'test262/test-end':
                    var test = batch[index++];
                    runner.validateResult(test, results);
                    results = { log: [] };

                    break;
                default:
                    results.log.push(line);
            }
        })

        fs.unlink(scriptFile);
        batchDone();
    });
}

