var test = require('tape');
var utils = require('./utils');
var expected = require('./expected');

var runners = [
    '-r node',
    '-r node-ip',
    '-r console -e node'
]
// default arguments and strict mode
runners.forEach(function(runner) {
    utils.testResultsCorrect(runner, expected.noTestStrict);
    utils.testResultsCorrect(runner + ' --testStrict', expected);
});

// batch mode supported by console runner
utils.testResultsCorrect('-r console -e node -b 5 -c test/nodeConfig.js', expected.noTestStrict);
utils.testResultsCorrect('-r console -e node -b 5 --testStrict -c test/nodeConfig.js', expected);

// batch mode not supported by node and node-ip
['node', 'node-ip'].forEach(function(runner) {
    var args = '-r ' + runner + ' -b 5';
    test(args, function(t) {
        t.plan(2);

        utils.run(args, function(res, stderr) {
            t.equal(res.length, 0, 'no results');
            t.ok(stderr.length > 0, 'stderr is present');
        });
    })
});

