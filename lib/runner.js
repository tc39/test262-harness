// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = Runner;
var util = require('util');
var helpers = require('./helpers');
var fs = require('fs');

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

Runner.prototype.deps = [];

Runner.prototype.compile = function(test) {
    this.deps.forEach(function(dep) {
        test.contents = dep + "\n" + test.contents;
    })

    this.link(test);

    if(test.strictMode) {
        test.contents = '"use strict";\n' + test.contents;
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

    // TODO: Normalize test cases to explicitly include this if needed?
    if(test.contents.indexOf("NotEarlyError") > -1) {
        test.contents = "var NotEarlyError = new Error('NotEarlyError');\n"
                        + test.contents;
    }

    test.contents = includeContent + test.contents;
}

// Result is expected to have the following keys:
// errorName: name of error thrown (if any)
// errorMessage: message from error thrown (used for debugging purposes)
// errorStack: stack trace of error thrown (used for debugging purposes)
// stdout: output of the test (a string, if running in-proc, collect all
//         logs and join with \n)
Runner.prototype.validateResult = function(test, result) {
    var isNegative = test.attrs.flags.negative || test.attrs.negative;

    if(result.errorName) {
        test.errorName = result.errorName;
        test.errorMessage = result.errorMessage;
        test.errorStack = result.errorStack;

        if(isNegative) {
            if(test.attrs.negative) {
                test.pass = result.errorName.match(new RegExp(test.attrs.negative));
            } else {
                test.pass = true
            }
        } else {
            test.pass = false
        }
    } else {
        if(isNegative) {
            test.pass = false;
        } else {
            test.pass = true;
        }
    }
}

Runner.prototype.run = function(test, done) {
    this.compile(test);
    this.execute(test, done);
}
