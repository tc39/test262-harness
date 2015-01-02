#!/usr/bin/env node

// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var args = require('minimist')(process.argv.slice(2), {
    alias: {
        consoleCommand: 'e',
        consolePrintCommand: 'p',
        runner: 'r',
        reporter: 'R',
        threads: 't',
        batch: 'b',
        config: 'c',
        compile: 'C',
        outputDir: 'o'
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
var t262 = require('../index');
var minimatch = require('minimatch');

if(args.config) require(path.join(process.cwd(), args.config));
t262.useConfig(args);

var Runner = t262.loadRunner();

// apply defaults
if(t262.config.batch === true) t262.config.batch = DEFAULT_BATCH_SIZE;
if(!t262.config.threads) t262.config.threads = 4;
if(!t262.config.reporter) t262.config.reporter = 'simple';
if(t262.config.compile === true) t262.config.compile = 'all';
if(!t262.config.outputDir && t262.config.compile)
    throw 'need output directory for compiled collateral';
if(t262.config.compile && !fs.existsSync(t262.config.outputDir)) fs.mkdirSync(t262.config.outputDir);

var start = Date.now();

var files = _(t262.config._.map(globStream)).merge();
if (t262.config.exclude) files = files.filter(exclude);
var contents = files.fork().map(readFile).sequence();
var tests = contents.zip(files.fork()).map(function(d) {
    return parser.parseFile({ contents: d[0].toString('utf8'), file: d[1]});
});
var getScenarios = scenarios(t262.config);
var scenarios = tests.flatMap(scenarioStream);
if(t262.config.batch) scenarios = _(scenarios).batch(t262.config.batch);

var trb = scenarios.pipe(new Tributary());
var results = _(function(push) {
    for(var i = 0; i < t262.config.threads; i++) push(null, run(trb.fork()));
    push(null, _.nil);
}).merge();


if(t262.config.compile) {
    optionsCopy = shallowCopy(t262.config);
    optionsCopy.batch = false;
    optionsCopy.compileOnly = true;
    var compiler = new Runner(optionsCopy);

    _(results).observe().each(function(test) {
        var compile = t262.config.compile === 'failures' && !test.pass;
        compile = compile || t262.config.compile === 'all';
        compile = compile || t262.config.compile === 'passes' && !!test.pass

        if(compile) {
            var testCopy = shallowCopy(test);
            compiler.compile(testCopy)
            var startPath = path.join(process.cwd(), t262.config.outputDir, path.basename(test.file));
            var currentPath = startPath;
            var counter = 0;
            while(fs.existsSync(currentPath)) {
                currentPath = startPath.replace(/.js$/, "-" + counter++ + ".js");
            }
            fs.writeFile(currentPath, testCopy.contents.replace(/\r\n/g, '\n'));
        }
    });

    results.on('end', function() {
        compiler.end();
    });
}

if(t262.config.reporter === 'json') {
    results.pipe(jss).pipe(process.stdout);
} else if(t262.config.reporter === 'tap') {
    results.pipe(tapify).pipe(process.stdout);
} else if(t262.config.reporter === 'simple') {
    results.pipe(simpleReporter);

    results.on('end', function() {
        console.log("Took " + ((Date.now() - start) / 1000) + " seconds");
    })
}

// takes a test collateral stream.
// Returns test results stream.
function run(tests) {
    var runner = new Runner(t262.config);

    var results = _(tests).map(function(test) {
        return _(function(push) {
            if(t262.config.batch) {
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

    results.on('end', function() {
        runner.end();
    });

    return results;
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

function shallowCopy(obj) {
    return Object.keys(obj).reduce(function(v, k) {
        return v[k] = obj[k], v;
    }, {});
}

// exclude tests specified in config
function exclude(test) {
    var f = true;
    for (var i = 0; i<t262.config.exclude.length; i++) {
        if (minimatch(test, t262.config.exclude[i])) {
            f = false;
            break;
        }
    }
    return f;
}