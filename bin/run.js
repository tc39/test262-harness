#!/usr/bin/env node

// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var parser = require('test262-parser');
var tapify = require('../lib/tapify');
var simpleReporter = require('../lib/simpleReporter.js');
var glob = require('glob');
var through = require('through');
var fs = require('fs');
var jss = require('JSONStream').stringify();
var scenarios = require('../lib/scenarios');

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
    }
});

// default to console runner if passing console command
if(args.consoleCommand && args.runner === 'node') {
    args.runner = 'console';
}

// Try to create our runner
var Runner;
try {
    Runner = require('../lib/runners/' + args.runner);
} catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') throw new Error('Runner ' + args.runner + ' not found.');
    throw e;
}

var runner = new Runner(args);
var results = parser
    .pipe(through(flatMap(scenarios(args))))
    .pipe(throughThreaded(function(test, done) {
        runner.run(test, done);
    }, args.threads));

if(args.reporter === 'json') {
    results.pipe(jss).pipe(process.stdout);
} else if(args.reporter === 'tap') {
    results.pipe(tapify).pipe(process.stdout);
} else if(args.reporter === 'simple') {
    results.pipe(simpleReporter);
}

// Make sure unnamed args are processed as glob patterns, even though unix-based
// system will auto-expand glob pattern args.
var files = args._.reduce(function (files, pattern) {
    return files.concat(glob.sync(pattern));
}, []);

processFiles(files);

function processFiles(files) {
    var index = -1;

    function nextFile() {
        index++;
        if(index < files.length) {
            processFile(files[index], nextFile);
        } else {
            parser.end();
        }
    }

    nextFile();

    function processFile(file, cb) {
        fs.readFile(file, 'utf8', function(err, contents) {
            parser.write({file: file, contents: contents});
            cb();
        });
    }
}

function flatMap(iterFn) {
    return function (test) {
        var iter = iterFn(test);
        var val = iter.next();

        while(!val.done) {
            this.queue(val.value);
            val = iter.next();
        }
    }
}

function throughThreaded(cb, threads) {
    var pending = 0;
    var done = false;

    return through(function(data) {
        var that = this;
        pending++;

        if(pending >= threads) that.pause();

        cb(data, function() {
            that.queue(data);
            pending--;
            if(done && pending === 0) that.queue(null);
            if(pending < threads && that.paused) that.resume();
        });
    }, function() {
        done = true;
        if(pending === 0) {
            this.queue(null);
        }
    })
}
