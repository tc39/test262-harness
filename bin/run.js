#!/usr/bin/env node

// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
const DEFAULT_TEST_TIMEOUT = 10000;

const parseFile = require('test262-parser').parseFile;
const compile = require('test262-compiler');
const fs = require('fs');
const Path = require('path');
const globber = require('../lib/globber.js');
const cli = require('../lib/cli.js');
const argv = cli.argv;
const validator = require('../lib/validator.js');
const Rx = require('rx');
const util = require('util');
const resultsEmitter = require('../lib/resultsEmitter.js');
const agentPool = require('../lib/agentPool.js');
const test262Finder = require('../lib/findTest262.js');
const scenariosForTest = require('../lib/scenarios.js');

// test262 directory (used to locate includes unless overridden with includesDir)
let test262Dir = argv.test262Dir;
// where to load includes from (usually a subdirectory of test262dir)
let includesDir = argv.includesDir;

// print version of test262-harness
if (argv.version) {
  printVersion();
  return;
}

// initialize reporter by attempting to load lib/reporters/${reporter}
// defaults to 'simple'
let reporter;
let reporterOpts = {};
if (fs.existsSync(Path.join(__dirname, '../lib/reporters', `${argv.reporter}.js`))) {
  reporter = require(`../lib/reporters/${argv.reporter}.js`);
} else {
  console.error(`Reporter ${argv.reporter} not found.`);
  process.exitCode = 1;
  return;
}

if (argv.reporterKeys) {
  if (argv.reporter !== 'json') {
    console.error('`--reporter-keys` option applies only to the `json` reporter.');
    process.exitCode = 1;
    return;
  }

  reporterOpts.reporterKeys = argv.reporterKeys.split(',');
}

// load preload contents
let preludeContents;
if (argv.prelude) {
  preludeContents = fs.readFileSync(argv.prelude, 'utf8');
} else {
  preludeContents = '';
}

// Select hostType and hostPath. hostType defaults to 'node'.
// If using default hostType, hostPath defaults to the current node executable location.
let hostType;
let hostPath;

if (argv.hostType) {
  hostType = argv.hostType;

  if (!argv.hostPath) {
    console.error('Missing host path. Pass --hostPath with a path to the host executable you want to test.');
    process.exitCode = 1;
    return;
  }

  hostPath = argv.hostPath;
} else {
  hostType = 'node';

  if (argv.hostPath) {
    hostPath = argv.hostPath;
  } else {
    hostPath = process.execPath;
  }
}

argv.timeout = argv.timeout || DEFAULT_TEST_TIMEOUT;

// Show help if no arguments provided
if (!argv._.length) {
  cli.showHelp();
  process.exitCode = 1;
  return;
}

// Test Pipeline
const pool = agentPool(Number(argv.threads), hostType, argv.hostArgs, hostPath, { timeout: argv.timeout });
const paths = globber(argv._);
if (!includesDir && !test262Dir) {
  test262Dir = test262Finder(paths.fileEvents[0]);
}
const files = paths.filter(p => p.indexOf("_FIXTURE") === -1).map(pathToTestFile);
const tests = files.map(compileFile);
const scenarios = tests.flatMap(scenariosForTest);
const pairs = Rx.Observable.zip(pool, scenarios);
const rawResults = pairs.flatMap(pool.runTest).tapOnCompleted(() => pool.destroy());
const results = rawResults.map(test => {
  test.result = validator(test);
  return test;
});
const resultEmitter = resultsEmitter(results);
reporter(resultEmitter, reporterOpts);

function printVersion() {
  const p = require(Path.resolve(__dirname, "..", "package.json"));
  console.log(`v${p.version}`);
}

function pathToTestFile(path) {
  return { file: path, contents: fs.readFileSync(path, 'utf-8')};
}

function compileFile(test) {
  const endFrontmatterRe = /---\*\/\r?\n/g;
  const match = endFrontmatterRe.exec(test.contents);
  if (match) {
    test.contents = test.contents.slice(0, endFrontmatterRe.lastIndex)
                    + preludeContents
                    + test.contents.slice(endFrontmatterRe.lastIndex);
  } else {
    test.contents = preludeContents + test.contents;
  }
  const parsed = parseFile(test);
  getDeps(parsed, { test262Dir: test262Dir, includesDir: includesDir });
  return parsed;
}

function getDeps(test, options = {}) {
  let deps = `
    function Test262Error(message) {
        if (message) this.message = message;
    }

    Test262Error.prototype.name = "Test262Error";

    Test262Error.prototype.toString = function () {
        return "Test262Error: " + this.message;
    };

    function $ERROR(err) {
      if(typeof err === "object" && err !== null && "name" in err) {
          throw err;
      } else {
        throw new Test262Error(err);
      }
    }

    function $DONE(err) {
      if (err) {
        if(typeof err === "object" && err !== null && "name" in err) {
          print('test262/error ' + err.name + ': ' + err.message);
        } else {
          print('test262/error Test262Error: ' + err);
        }
      }
      print('test262/done');
      $262.destroy();
    }

    function $LOG(str) {
      print(str);
    }`

  if (!options.test262Dir && !options.includesDir) {
    throw new Error("Need one of test262Dir or includesDir options");
  }

  if (options.test262Dir && !options.includesDir) {
    options.includesDir = Path.join(options.test262Dir, 'harness');
  }

  let helpers = test.attrs.includes;
  helpers.push('assert.js');
  for (var i = 0; i < helpers.length; i++) {
    deps += '\n';
    deps += fs.readFileSync(Path.join(options.includesDir, helpers[i]));
  }

  test.deps = deps;
}