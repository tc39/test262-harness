var all = [
    { file: 'test/collateral/async.js', strictMode: false, pass: true },
    { file: 'test/collateral/async.js', strictMode: true, pass: true },
    { file: 'test/collateral/asyncNegative.js', strictMode: false, pass: true },
    { file: 'test/collateral/asyncNegative.js', strictMode: true, pass: true },
    { file: 'test/collateral/bothStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/bothStrict.js', strictMode: true, pass: true },
    { file: 'test/collateral/strict.js', strictMode: true, pass: true },
    { file: 'test/collateral/noStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/rawStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/rawStrict.js', strictMode: true, pass: true },
    { file: 'test/collateral/rawNoStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/rawNoStrict.js', strictMode: true, pass: true },
    { file: 'test/collateral/error.js', strictMode: false, pass: false, errorMessage: 'failure message', errorName: 'Test262Error' },
    { file: 'test/collateral/error.js', strictMode: true, pass: false, errorMessage: 'failure message', errorName: 'Test262Error' },
    { file: 'test/collateral/thrownError.js', strictMode: false, pass: false, errorMessage: 'failure message', errorName: 'Error', topOfStack: "foo" },
    { file: 'test/collateral/thrownError.js', strictMode: true, pass: false, errorMessage: 'failure message', errorName: 'Error', topOfStack: "foo" },
    { file: 'test/collateral/negativeMessage.js', strictMode: false, pass: false, errorMessage: "'ExpectedError' is expected, but was not thrown", errorName: 'Error Expected'},
    { file: 'test/collateral/negativeMessage.js', strictMode: true, pass: false, errorMessage: "'ExpectedError' is expected, but was not thrown", errorName: 'Error Expected'},
]

var seen = {};

all.noTestStrict = all.filter(function(t) {
    if(seen.hasOwnProperty(t.file)) return false;
    return seen[t.file] = true;
})

// non-strict test results excluding tests starting with a or b
all.excludeAB = all.noTestStrict.filter(function(t) {
    return (t.file.indexOf('test/collateral/a') *
        t.file.indexOf('test/collateral/b') != 0)
})

module.exports = all;
