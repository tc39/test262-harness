var Runner = require('../runner');
var ConsoleRunner = require('./console');
var cp = require('child_process');
var _ = require('highland');

module.exports = NodeRunner;

function NodeRunner(args) {
    args.consoleCommand = args.consoleCommand || "node";
    var runner = this;

    this.needsCtrlFlow = !!args.compileOnly;

    ConsoleRunner.apply(this, arguments);

    if(!args.compileOnly) {
        // HACK: Probably doesn't handle quoted arguments and other
        // complexities.
        var parts = (args.consoleCommand + " " + args.consoleArguments)
            .trim()
            .split(" ");
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
}
NodeRunner.prototype = Object.create(ConsoleRunner.prototype);
NodeRunner.prototype.execute = function(test, cb) {
    this._test = test;
    this._testDone = cb;
    this._instance.stdin.write(JSON.stringify(test));
}

NodeRunner.prototype.end = function() {
    if(this._instance) this._instance.stdin.end();
}
