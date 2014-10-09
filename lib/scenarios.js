var util = require('util');
// Returns a function that takes a test and returns an iterator for copies
// of test for each scenario required.
// Currently only strictness is supported.
module.exports = function(opts) {
    return function(test) {
        return strictnessTests(test, opts);
    }
}

function strictnessTests(test, opts) {
    var tests = [];
    var index = 0;
    var copy;

    if(!test.attrs.flags.onlyStrict) {
        // BT: Enable by default once test262 is strict-clean.
        copy = util._extend({}, test);
        copy.attrs = util._extend({}, test.attrs);
        test.strictMode = false;
        tests.push(copy);
    }

    if(!test.attrs.flags.noStrict && opts.testStrict) {
        var copy = util._extend({}, test);
        copy.attrs = util._extend({}, test.attrs);
        copy.attrs.description += ' (Strict Mode)'
        copy.strictMode = true;
        tests.push(copy);
    }

    return {
        next: function() {
            if(index === tests.length) return { done: true }

            return { done: false, value: tests[index++] }
        }
    }
}
