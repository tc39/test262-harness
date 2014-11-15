exports.Runner = require('./lib/runner')
exports.ConsoleRunner = require('./lib/runners/console')
exports.NodeRunner = require('./lib/runners/node')
exports.JSShellRunner = require('./lib/runners/jsshell')

var config = exports.config = {};

exports.useConfig = function(conf) {
    Object.keys(conf).forEach(function(k) { 
        config[k] = conf[k];
    })
}
