var Runner = require('../runner');
var ConsoleRunner = require('./console');
var cp = require('child_process');

module.exports = NodeRunner;

function NodeRunner(args) {
    args.consoleCommand = 'dummy';
    var runner = this;
    ConsoleRunner.apply(this, arguments);
    this.deps = []; // all env deps provided by nodehost.js
    
    this._instance = cp.fork(__dirname + '/nodehost.js')
    this._instance.on('message', function(result) {
        runner.validateResult(runner._test, result)
        runner._testDone();
    })
}
NodeRunner.prototype = Object.create(ConsoleRunner.prototype);
NodeRunner.prototype.execute = function(test, cb) {
    this._test = test;
    this._testDone = cb;
    this._instance.send(test.contents);
}

NodeRunner.prototype.end = function() {
    this._instance.disconnect();
}
