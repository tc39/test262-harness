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
    // add call to $DONE at the bottom of the test file if it's not
    // present.
    if(test.contents.indexOf("$DONE") === -1) {
        // lead with a semicolon to prevent ASI nonsense.
        test.contents += "\n;$DONE();\n"
    }

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

var errorLogRe = /^test262\/error (.*)$/;
// Result is expected to have the following keys:
// errorString: Error of the form ErrorName: ErrorMessage. Optional.
// log: An array of log strings. Optional.
// doneCalled: boolean indicating whether $DONE was called by the test.
// errorName: name of error thrown (if any)
// errorMessage: message from error thrown (used for debugging purposes)
// errorStack: stack trace of error thrown (used for debugging purposes)
Runner.prototype.validateResult = function(test, result) {
    var isNegative = test.attrs.flags.negative || test.attrs.negative;
    // parse result from log
    (result.log || []).forEach(function(log) {
        var errorMatch = log.match(errorLogRe);
        if(errorMatch) {
            result.errorString = errorMatch[1];
            return;
        }

        if(log === "test262/done") {
            result.doneCalled = true;
        }
    })

    // parse errorString if present
    if(result.errorString) {
        var match = result.errorString.match(/(\w+): (.*)$/m);
        if(match) {
            result.errorName = match[1];
            result.errorMessage = match[2];
        } else {
            result.errorName = result.errorString || null;
        }
    }

    // validate results against expected results
    if(result.errorName) {
        test.errorName = result.errorName;
        test.errorMessage = result.errorMessage;
        test.errorStack = result.errorStack;

        if(isNegative) {
            if(test.attrs.negative) {
                // failure can either match against error name, or an exact match
                // against error message (the latter case is thus far only to support
                // NotEarlyError thrown errors which have an error type of "Error").
                test.pass =
                    result.errorName.match(new RegExp(test.attrs.negative)) ||
                    result.errorMessage === test.attrs.negative;
            } else {
                test.pass = true
            }
        } else {
            test.pass = false
        }
    } else {
        // ensure $DONE was called if there wasn't an error reported
        if(!result.doneCalled) {
            test.pass = false;
            test.errorName = "Test262 Error";
            test.errorMessage = "Test did not run to completion ($DONE not called)";
        } else if(isNegative) {
            test.pass = false;
        } else {
            test.pass = true;
        }
    }
}

Runner.prototype.runBatch = function(batch, done) {
    batch.forEach(function(test) {
        this.compile(test);
    }, this);

    this.executeBatch(batch, done);
}

Runner.prototype.run = function(test, done) {
    this.compile(test);
    this.execute(test, function() {
        done(null, test);
    });
}

// default no-op
Runner.prototype.end = function() {};
