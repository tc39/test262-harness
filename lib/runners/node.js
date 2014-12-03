var Runner = require('../runner');
var ConsoleRunner = require('./console');
var cp = require('child_process');
var _ = require('highland');

module.exports = NodeRunner;

function NodeRunner(args) {
    args.consoleCommand = args.consoleCommand || "node";
    var runner = this;

    ConsoleRunner.apply(this, arguments);

    this.deps = []; // all env deps provided by nodehost.js

    // HACK: Probably doesn't handle quoted arguments and other
    // complexities.
    var parts = args.consoleCommand.split(" ");
    parts.push(__dirname + '/nodehost.js');
                                          
    this._instance = cp.spawn(parts[0], parts.slice(1));


    var results = { log: [] };

    _(this._instance.stdout).flatMap(function(data) {
        return _(data.toString().split(/\r?\n/g));
    }).each(function(line) {
        results.log.push(line);
        switch(line) {
            case 'test262/done':
                runner.validateResult(runner._test, results);
                results = { log: [] };

                runner._testDone();
                break;
        }
    })
}
NodeRunner.prototype = Object.create(ConsoleRunner.prototype);
NodeRunner.prototype.execute = function(test, cb) {
    this._test = test;
    this._testDone = cb;
    this._instance.stdin.write(test.contents);
}

NodeRunner.prototype.end = function() {
    this._instance.stdin.end();
}
