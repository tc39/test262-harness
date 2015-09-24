// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = Runner;
var util = require('util');
var fs = require('fs');
var path = require('path');
var parseFile = require('test262-parser').parseFile;

var autoIncludes = ['assert.js'];

function Runner(opts) {
    this.opts = opts

    if(opts.prelude) {
        try {
            this.preludeContent = fs.readFileSync(opts.prelude, 'utf8');
        } catch(e) {
            throw new Error("Prelude file not found");
        }
    }

    if(!opts.includesDir || !fs.existsSync(opts.includesDir)) {
        throw new Error("Helper directory " + opts.includesDir + " not found");
    }

    this.helpers = loadHelpers(opts.includesDir);

    this._errorSrc = this.test262ErrorSrc + "\n;" + this.errorFnSrc;

    if (this.needsCtrlFlow) {
        if (!this.logFnSrc) {
            throw new Error('`$LOG` function not implemented.');
        }

        if (!this.doneFnSrc) {
            throw new Error('`$DONE` function not implemented.');
        }

        this._ctrlFlowSrc = this.logFnSrc + "\n;" + this.doneFnSrc;
    }
};

/**
 * Boolean attribute which controls whether the runner should inject code for
 * control flow. If true, the runner's `doneFnSrc` and `logFnSrc` will be
 * inserted into each test prior to execution.
 */
Runner.prototype.needsCtrlFlow = true;

/**
 * JavaScript source code that defines a function binding for the identifier
 * `$LOG`. This must be defined by Runner subclasses that require control flow.
 */
Runner.prototype.logFnSrc = null;

/**
 * JavaScript source code that defines a function binding for the identifier
 * `$DONE`. This must be defined by Runner subclasses that require control
 * flow.
 */
Runner.prototype.doneFnSrc = null;

/**
 * JavaScript source code that defines a constructor function bound to the
 * identifier `Test262Error`.
 */
Runner.prototype.test262ErrorSrc = function() {
    function Test262Error(message) {
        if (message) this.message = message;
    }

    Test262Error.prototype.name = "Test262Error";

    Test262Error.prototype.toString = function () {
        return "Test262Error: " + this.message;
    };
}.toString().slice(14, -1);

/**
 * JavaScript source code that defines a function binding for the identifier
 * `$ERROR`.
 */
Runner.prototype.errorFnSrc = function $ERROR(err) {
    if(typeof err === "object" && err !== null && "name" in err)
        throw err;
    else throw new Test262Error(err);
}.toString();

Runner.prototype.compile = function(test) {
    if (test.attrs.flags.raw) {
        return;
    }

    // add call to $DONE at the bottom of the test file if it's not
    // present.
    if(test.contents.indexOf("$DONE") === -1) {
        // lead with a semicolon to prevent ASI nonsense.
        test.contents += "\n;$DONE();\n"
    }

    test.contents = this._errorSrc + "\n;" + test.contents;

    if (this.needsCtrlFlow) {
        test.contents = this._ctrlFlowSrc + "\n;" + test.contents;
    }

    this.link(test);

    if(test.strictMode) {
        test.contents = '"use strict";\n' + test.contents;
    }

}

Runner.prototype.link = function(test) {
    var runner = this;
    var includeContent = '';
    var included = [];

    if(this.preludeContent) {
        includeContent += this.preludeContent;
    }

    function addIncludesFor(file) {
        file.attrs.includes.forEach(addInclude);
    }

    function addInclude(dep) {
        if(!runner.helpers[dep]) throw new Error('Helper not found: ' + dep);
        if(included.indexOf(dep) > -1) return;

        includeContent += runner.helpers[dep].contents;

        addIncludesFor(runner.helpers[dep]);
    }

    autoIncludes.forEach(addInclude);
    addIncludesFor(test);

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
    var expectingStack = false;
    var negative = test.attrs.negative;
    // parse result from log
    (result.log || []).forEach(function(log) {
        var errorMatch = log.match(errorLogRe);
        if(errorMatch) {
            result.errorString = errorMatch[1];
            expectingStack = true;
            return;
        }

        if(expectingStack) {
            if(log.match(/^\s+at/)) {
                result.errorStack = result.errorStack || result.errorString + "\n";
                result.errorStack += log + "\n";
                return;
            } else {
                expectingStack = false;
            }
        }

        if(log === "test262/done") {
            result.doneCalled = true;
        }
    })

    // parse errorString if present
    if(result.errorString) {
        result.errorString = result.errorString.trim();
        var match = result.errorString.match(/(\w+): (.*)$/m);
        if(match) {
            result.errorName = match[1];
            result.errorMessage = match[2];
            if(result.errorString.split("\n").length > 1) {
                result.errorStack = "\n" + result.errorString;
            }
        } else {
            result.errorName = result.errorString || null;
        }
    }

    // validate results against expected results
    if(result.errorName) {
        test.errorName = result.errorName;
        test.errorMessage = result.errorMessage;
        test.errorStack = result.errorStack;

        if(negative) {
            // failure can either match against error name, or an exact match
            // against error message (the latter case is thus far only to support
            // NotEarlyError thrown errors which have an error type of "Error").
            test.pass =
                !!result.errorName.match(new RegExp(negative)) ||
                result.errorMessage === negative;
        } else {
            test.pass = false
        }
    } else {
        // ensure $DONE was called if there wasn't an error reported
        if(!result.doneCalled && !test.attrs.flags.raw) {
            test.pass = false;
            test.errorName = "Test262 Error";
            test.errorMessage = "Test did not run to completion ($DONE not called)";
        } else if(negative) {
            test.pass = false;
            test.errorName = "Error Expected";
            test.errorMessage = "'" + negative + "' is expected, but was not thrown";
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

function loadHelpers(dir) {
    return fs.readdirSync(dir)
        .reduce(function(map, file) {
            var contents = fs.readFileSync(path.join(dir, file), 'utf-8');
            map[file] = parseFile({contents: contents, file: file});

            return map;
        }, {});
}
