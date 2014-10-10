// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = NodeRunner;

var vm = require('vm');
var Runner = require('../runner');

function NodeRunner() { Runner.apply(this, arguments); }
NodeRunner.prototype = Object.create(Runner.prototype);
NodeRunner.prototype.execute = function(test, cb) {
    var contents = test.contents;
    var error;
    var result = {log: []};
    
    var context = {
        $ERROR: function(err) {
            error = err;
        },
        $DONE: function(err) {
            if(err) context.$ERROR(err);
            result.doneCalled = true;
        },
        $LOG: function(log) {
            result.log.push(log);
        }
    }
    try {
        vm.runInNewContext(contents, context);
    } catch(e) {
        error = e;
    }

    process.nextTick(function () {
        if(error) {
            if(typeof error === 'object') {
                // custom thrown errors won't have a name property.
                result.errorName = error.name || "Test262Error";
                result.errorMessage = error.message;
                result.errorStack = error.stack
            } else {
                result.errorName = error;
            }
        }

        this.validateResult(test, result);
        cb();
    }.bind(this));
}
