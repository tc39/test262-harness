var through = require('through');
var path = require('path');
var tty = require('tty');
var EOL = require('os').EOL;

var state = {
    pass: 0,
    fail: 0,
}

function canonicalizePath(p) {
    if(path.sep === '\\') {
        // canonicalize on forward slash seperator
        p = p.replace(/\\/g, '/');
    }
    return p;
}

module.exports = function(basePath) {
    basePath = canonicalizePath(basePath);

    return through(function(data) {
        if(data.pass) {
            state.pass++;
            process.stdout.write("PASS " + canonicalizePath(path.relative(basePath, data.file)) + EOL);
        } else {
            state.fail++;
            process.stdout.write("FAIL " + canonicalizePath(path.relative(basePath, data.file)) + EOL);
        }
    }, function() {
        // output stats to both baseline on stdout and console on stderr
        // but do not output to stdout if it was not redirected to a file
        if(!tty.isatty(process.stdout.fd)) {
            process.stdout.write("Ran " + (state.pass + state.fail) + " tests" + EOL)
            process.stdout.write(state.pass + " passed" + EOL)
            process.stdout.write(state.fail + " failed" + EOL)
        }

        process.stderr.write("Ran " + (state.pass + state.fail) + " tests" + EOL)
        process.stderr.write(state.pass + " passed" + EOL)
        process.stderr.write(state.fail + " failed" + EOL)
    });
}
