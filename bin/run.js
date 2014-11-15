#!/usr/bin/env node

// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var args = require('minimist')(process.argv.slice(2), {
    default: {
        runner: 'node',
        reporter: 'simple',
        threads: 4,
    },
    alias: {
        consoleCommand: 'e',
        consolePrintCommand: 'p',
        runner: 'r',
        reporter: 'R',
        threads: 't',
        batch: 'b'
    }
});

var parser = require('test262-parser');
var tapify = require('../lib/tapify');
var simpleReporter = require('../lib/simpleReporter.js');
var _ = require('highland');
var glob = require('glob');
var fs = require('fs');
var path = require('path');
var jss = require('JSONStream').stringify();
var Tributary = require('stream-bifurcate')

var scenarios = require('../lib/scenarios');
var readFile = _.wrapCallback(fs.readFile);
var DEFAULT_BATCH_SIZE = 75;

if(args.config) {
    require(path.join(process.cwd(), args.config));
}

var t262 = require('../index')
console.log(t262.config);

console.log()

var Runner = loadRunner();
console.log(Runner);

// default to console runner if passing console command
if(args.consoleCommand && args.runner === 'node') {
    args.runner = 'console';
}

// apply default batch size
if(args.batch === true) args.batch = DEFAULT_BATCH_SIZE;

var start = Date.now();

var files = _(args._.map(globStream)).merge();
var contents = files.fork().map(readFile).sequence();
var tests = contents.zip(files.fork()).map(function(d) {
    return parser.parseFile({ contents: d[0].toString('utf8'), file: d[1]});
});
var getScenarios = scenarios(args);
var scenarios = tests.flatMap(scenarioStream);
if(args.batch) scenarios = _(scenarios).batch(args.batch);

var trb = scenarios.pipe(new Tributary());
var results = _(function(push) {
    for(var i = 0; i < args.threads; i++) push(null, run(trb.fork()));
    push(null, _.nil);
}).merge();

results.on('end', function() {
    console.log("Took " + ((Date.now() - start) / 1000) + " seconds");
})

if(args.reporter === 'json') {
    results.pipe(jss).pipe(process.stdout);
} else if(args.reporter === 'tap') {
    results.pipe(tapify).pipe(process.stdout);
} else if(args.reporter === 'simple') {
    results.pipe(simpleReporter);
}

// takes a test collateral stream.
// Returns test results stream.
function run(tests) {
    var runner = new Runner(args);

    return _(tests).map(function(test) {
        return _(function(push) {
            if(args.batch) {
                runner.runBatch(test, function() {
                    test.forEach(function(t) {
                        push(null, t);
                    })
                    push(null, _.nil);
                });
            } else {
                runner.run(test, function() {
                    push(null, test);
                    push(null, _.nil);
                });
            }
        });
    }).sequence();
}

// takes a file path and returns a stream of filenames
// that match it
function globStream(p) {
    var mg = glob(p);
    var source = _('match', mg);
    mg.on('end', function() { source.end() })

    return source;
}

// takes a test and returns a stream of all the scenarios
function scenarioStream(test) {
    var iter = getScenarios(test);
    return _(function(push) {
        var rec = iter.next();
        while(!rec.done) {
            push(null, rec.value);
            rec = iter.next();
        }

        push(null, _.nil);
    })
}

// Load the runner
function loadRunner() {
    if(t262.config.runner) return t262.config.runner;

    try {
        return require('../lib/runners/' + args.runner);
    } catch(e) {
        if(e.code === 'MODULE_NOT_FOUND') throw new Error('Runner ' + args.runner + ' not found.');
        throw e;
    }
}
