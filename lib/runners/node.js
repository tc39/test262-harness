// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = NodeRunner;

var vm = require('vm');
var Runner = require('../runner');

function NodeRunner() { Runner.apply(this, arguments); }
NodeRunner.prototype = Object.create(Runner.prototype);
NodeRunner.prototype.run = function(test, cb) {
    var contents = test.contents;
    var error;
    
    try {
        vm.runInNewContext(contents, {
            $ERROR: function(err) {
                error = err;
            },
            $DONE: function(err) {
                cb(err);
            }
        });
    } catch(e) {
        error = e;
    }

    if (test.async) {
        return;
    }

    process.nextTick(function () {
        if(error) {
            if(typeof error === 'object') {
                // custom thrown errors won't have a name property.
                cb(error.name || "Test262Error", error.message, error.stack);
            } else {
                cb(error, null, null);
            }
        } else {
            cb();
        }
    });
}
