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

exports.loadRunner = function loadRunner() {
    if(typeof config.runner === 'string')
        return requireRunner(config.runner);

    if(typeof config.runner === 'function')
        return config.runner;

    if(config.consoleCommand)
        return requireRunner('console')

    return requireRunner('node');
}

function requireRunner(name) {
    try {
        return require('./lib/runners/' + name);
    } catch(e) {
        if(e.code === 'MODULE_NOT_FOUND')
            throw new Error('Runner ' + name + ' not found.');
        throw e;
    }
}
