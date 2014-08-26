// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = Runner;
var through = require('through');
var duplex = require('duplexer');
var util = require('util');
var helpers = require('./helpers');
var fs = require('fs');

// TODO: ES6ify
function iteratorFor(arr) {
    return {
        index: 0,
        next: function() {
            return {
                done: this.index >= arr.length - 1,
                value: arr[this.index++]
            };
        }
    }
}

function Runner(opts) {
    this.opts = opts

    if(opts.prelude) {
        try {
            this.preludeContent = fs.readFileSync(opts.prelude, 'utf8');
        } catch(e) {
            throw new Error("Prelude file not found");
        }
    }
};

Runner.prototype.compile = function(test) {
    var tests = [];
    var index = 0;

    if(test.attrs.onlyStrict) {
        test.strict = true;
    } else if(!test.attrs.noStrict && this.opts.testStrict) {
        // BT: Enable by default once test262 is strict-clean.
        var copy = util._extend({}, test);
        copy.attrs = util._extend({}, test.attrs);
        copy.attrs.description += ' (Strict Mode)'
        copy.strict = true;
        tests.push(copy);
    }

    tests.push(test);

    return {
        next: function() {
            if(index === tests.length) {
                return { done: true }
            } else {
                return { done: false, value: tests[index++] }
            }
        }
    }
}

Runner.prototype.link = function(test) {
    var includeContent = '';
    var included = [];


    if(this.preludeContent) {
        includeContent += this.preludeContent;
    }

    function getIncludesFor(file) {
        file.attrs.includes.forEach(function(dep) {        
            if(!helpers[dep]) throw 'Helper not found: ' + dep;
            if(included.indexOf(dep) > -1) return;

            includeContent += helpers[dep].contents;
            
            getIncludesFor(helpers[dep]);
        })
    }

    getIncludesFor(test);

    test.contents = includeContent + test.contents;

    if (test.strict) {
        test.contents = '"use strict";\n' + test.contents;
    }

    return test;
}

Runner.prototype.getStreamingCompiler = function() {
    var runner = this;

    var compilerStream = through(function(test) {
        var iter = runner.compile(test);

        var val = iter.next();
        while(!val.done) {
            this.queue(runner.link(val.value));
            var val = iter.next();
        }
    });

    var runnerStream = through(function(test) {
        var isNegative = test.attrs.flags.negative || test.attrs.negative;
        var that = this;
        that.pending++;

        if(that.pending >= runner.opts.threads) {
            that.pause();
        }

        runner.run(test, function(error, message, stack) {
            if(error) {
                test.error = error;
                test.errorMessage = message;
                test.errorStack = stack;
            }
            if (error && test.attrs.negative) {
                test.pass = error.match(new RegExp(test.attrs.negative));
            } else {
                test.pass = (error && isNegative) || (!error && !isNegative);
            }

            that.queue(test);
            that.pending--;
            if(that.noMore && that.pending === 0) {
                that.queue(null);
            }

            if(that.pending < runner.opts.threads && that.paused) that.resume()

        })
    }, function() {
        this.noMore = true;
        if(this.pending === 0) {
            this.queue(null);
        }
    });

    runnerStream.pending = 0;

    compilerStream.pipe(runnerStream);

    return duplex(compilerStream, runnerStream);
}
