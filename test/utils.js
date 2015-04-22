var path = require('path');
var cp = require('child_process');
var test = require('tape');

function resultsForTest(results, test) {
    for(var i = 0; i < results.length; i++) {
        if(test.file === results[i].file &&
           !!test.strictMode === !!results[i].strictMode) {
            return results[i];
        }
    }

    throw "Can't find results for " + test.file;
}

function expectedString(exp) {
    var str = exp.file + " ";
    
    if(exp.pass) str += "passes";
    else str += "fails";

    if(exp.strictMode) str += " in strict mode";

    return str;
}

/**
 * Creates a test that ensures the harness runs tests without error and that the tests
 * pass or fail as expected.
 * @param {string} args Arguments to pass to the harness. Does not handle quoted strings.
 * @param {result[]} expectedResults expected pass results for the tests.
 */
exports.testResultsCorrect = function testResultsCorrect(args, path, expectedResults) {
    if(!expectedResults) {
        expectedResults = path;
        path = undefined;
    }

    test(args, function(t) {
        exports.run(args, path, function(res, stderr) {
            t.equal(stderr, "", "No stderr is present");
            t.equal(res.length, expectedResults.length, expectedResults.length + " tests run");
            expectedResults.forEach(function(exp) {
                var act = resultsForTest(res, exp);
                t.equal(act.pass, exp.pass, expectedString(exp));

                if(!exp.pass) {
                    // validate error message and such
                    t.equal(act.errorName, exp.errorName, "Error name is " + exp.errorName);
                    t.equal(act.errorMessage, exp.errorMessage, "Error message is " + exp.errorMessage);

                    if(exp.topOfStack) {
                        t.ok(act.errorStack.indexOf(exp.topOfStack) > -1, "Stack contains " + exp.topOfStack);
                    }
                }
            });
            t.end();
        });
    });
}


/**
 * @callback runCallback
 * @param {Array} results Test results taken from JSON logger..
 * @param {string} stderr Text written to stderr.
 */

/**
 * Runs test262-harness with the specified arguments.
 * @param {string} args Arguments to pass to the harness. Does not handle quoted strings.
 * @param {string} path Path to look for test collateral. Defaults to test/collateral/*.js
 * @param {runCallback} done
 */
exports.run = function run(args, path, done) {
    var stdout = '';
    var stderr = '';
    if(!done) {
        done = path;
        path = undefined;
    }

    if(path === undefined) path = 'test/collateral/*.js';

    args = args.split(" ").concat('--reporter', 'json', path);

    var child = cp.fork('bin/run.js', args, {silent: true})
    child.stdout.on('data', function(d) { stdout += d });
    child.stderr.on('data', function(d) { stderr += d });
    child.on('exit', function() {
        try {
            var parsed = JSON.parse(stdout);
        } catch(e) {
            parsed = [];
        }

        done(parsed, stderr);
    })
}
