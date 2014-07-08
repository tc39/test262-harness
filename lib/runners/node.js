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
            }
        });
    } catch(e) {
        error = e.name || e;
    }

    cb(error);
}
