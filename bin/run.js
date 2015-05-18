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
        outputDir: 'o',
        test262Dir: 'T',
        help: 'h',
        version: 'v'
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
var Liftoff = require('liftoff');
var cli = new Liftoff({ name: 'test262-harness'})

if(args.version) {
    printVersion();
    process.exit(0);
}

if(args.help) {
    printHelp();
    process.exit(0);
}

cli.launch({
    cwd: args.cwd,
    configPath: args.config
}, function(env) {
    var t262 = initEnv(env);

    // load config file if specified
    if(env.configPath) {
        require(env.configPath);
    }

    // If we've loaded a console command config path,
    // add it to the 
    if(t262.config.consoleCommand) {
        t262.config.consoleCommand = path.join(env.cwd, t262.config.consoleCommand);
    }

    // command line flags override anything specified by config files
    t262.useConfig(args);
    
    applyDefaults(t262.config);

    var Runner = t262.loadRunner();

    var files = getFilesStream(t262.config);
    var contents = files.fork().map(readFile).sequence();

    var start = Date.now();

    var tests = contents.zip(files.fork()).map(function(d) {
        return parser.parseFile({ contents: d[0].toString('utf8'), file: d[1]});
    });

    var scenarioStream = getScenarioStream(t262.config);
    var scenarios = tests.flatMap(scenarioStream);

    if(t262.config.batch) scenarios = _(scenarios).batch(t262.config.batch);

    var trb = scenarios.pipe(new Tributary());
    var results = _(function(push) {
        for(var i = 0; i < t262.config.threads; i++) push(null, run(Runner, t262.config, trb.fork()));
        push(null, _.nil);
    }).merge();

    if(t262.config.compile) compile(Runner, results);

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
});

// takes a test collateral stream.
// Returns test results stream.
function run(Runner, config, tests) {
    var runner = new Runner(config);

    var results = _(tests).map(function(test) {
        return _(function(push) {
            if(config.batch) {
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
function getScenarioStream(config) {
    return function(test) {
        var iter = scenarios(config)(test);
        return _(function(push) {
            var rec = iter.next();
            while(!rec.done) {
                push(null, rec.value);
                rec = iter.next();
            }

            push(null, _.nil);
        })
    }
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

// dump files to disk based on the compile flag
function compile(Runner, results) {
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
            fs.writeFileSync(currentPath, testCopy.contents.replace(/\r\n/g, '\n'));
        }
    });

    results.on('end', function() {
        compiler.end();
    });

}

// Walk recursively up the directory tree looking for a directory which
// has a "harness" directory next to a "test" directory. Return the
// path to the "test" directory.
function includesDirFromGlob(p) {
    if(!p) return null;

    var dir = path.dirname(p);
    var base = path.basename(p);

    if(base !== "test") {
        if(dir === p) return null; // reached the root directory

        return includesDirFromGlob(dir);
    }

    var harnessPath = path.join(dir, 'harness');

    // see if the harness directory exists here
    if(fs.existsSync(harnessPath)) {
        return harnessPath;
    } else {
        return includesDirFromGlob(dir);
    }
}

function initEnv(env) {
    if(!env.modulePath) {
        // try loading local module (to support running from test262-harness directory)
        try {
            var t262 = require("../index.js");
            
            // possibly il-advised sanity check to make sure we're not requiring the index
            // of some other project.
            if(!t262.useConfig) throw 1;

            return t262;
        } catch(e) {
            console.error("Cannot find local test262-harness install. Run npm install test262-harness.")
            process.exit(1);
        }
    } else {
        return require(env.modulePath);
    }
}

function applyDefaults(config) {
    if(config.batch === true) config.batch = DEFAULT_BATCH_SIZE;
    if(!config.threads) config.threads = 4;
    if(!config.reporter) config.reporter = 'simple';
    if(config.compile === true) config.compile = 'all';
    if(!config.outputDir && config.compile)
        throw 'need output directory for compiled collateral';
    if(config.compile && !fs.existsSync(config.outputDir)) fs.mkdirSync(config.outputDir);

    if(!config.includesDir) {
        if(config.test262Dir) {
            // relative to test262dir
            config.includesDir = path.join(config.test262Dir, 'harness');
        } else {
            var fromGlob = includesDirFromGlob(config._[0]);

            if(fromGlob) {
                config.includesDir = fromGlob;
            } else if(fs.existsSync('harness/')) {
                // harness dir is present in our cwd
                config.includesDir = 'harness/';
            } else {
                // else fall back to local harness deps
                config.includesDir = path.join(__dirname, '../lib/helpers/');
            }
        }
    }

    if(!config.consoleArguments) config.consoleArguments = "";
}

function getFilesStream(config) {
    var files = config._;

    // by default, run all files recursively when we pass test262Dir
    if(config.test262Dir && files.length === 0) {
        files = ['**/*.js']
    }

    files = files.map(function(p) {
        if(config.test262Dir) {
            p = path.join(config.test262Dir, 'test', p);
        }

        if(fs.existsSync(p) && fs.statSync(p).isDirectory()) {
            p = path.join(p, '**/*.js');
        }

        return p;
    });

    files = _(files.map(globStream)).merge();

    if (config.exclude) files = files.filter(exclude);

    return files;
}

function printVersion() {
    var p = require(path.resolve(__dirname, "..", "package.json"));
    console.log("test262-harness v" + p.version);
}

function printHelp() {

    printVersion();

    console.log("Usage: test262-harness [options] [files]");
    console.log("");
    console.log("Options:");
    console.log(" -r, --runner               Specify runner (node, node-ip, jsshell, console)");
    console.log(" -c, --config               Load a config.js file");
    console.log(" -C, --compile              Save compiled tests.");
    console.log(" -o, --outputDir            Output directory for compiled tests.");
    console.log(" -e, --consoleCommand       Command for console runner.");
    console.log(" --consoleArguments         Arguments for console runner.");
    console.log(" -p, --consolePrintCommand  Print command.");
    console.log(" -t, --threads              Run this many tests in parallel.");
    console.log(" -b, --batch                How many tests to batch together.");
    console.log(" --testStrict               Tests both strict and non-strict mode.");
    console.log(" -R, --reporter             Specify reporter (json, tap, simple).");
    console.log(" --prelude                  Prepends specified file to each test file.");
    console.log(" --includesDir              Directory with includes. Usually inferred.");
    console.log(" -T, --test262Dir           Root directory of test262.");
    console.log(" -v, --version              Print test262-harness version.");
    console.log(" -h, --help                 Print short help.");
}

