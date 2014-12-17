var all = [
    { file: 'test/collateral/async.js', strictMode: false, pass: true },
    { file: 'test/collateral/async.js', strictMode: true, pass: true },
    { file: 'test/collateral/asyncNegative.js', strictMode: false, pass: true },
    { file: 'test/collateral/asyncNegative.js', strictMode: true, pass: true },
    { file: 'test/collateral/bothStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/bothStrict.js', strictMode: true, pass: true },
    { file: 'test/collateral/strict.js', strictMode: true, pass: true },
    { file: 'test/collateral/noStrict.js', strictMode: false, pass: true },
    { file: 'test/collateral/error.js', strictMode: false, pass: false },
    { file: 'test/collateral/error.js', strictMode: true, pass: false },
]

var seen = {};

all.noTestStrict = all.filter(function(t) {
    if(seen.hasOwnProperty(t.file)) return false;
    return seen[t.file] = true;
})

module.exports = all;
