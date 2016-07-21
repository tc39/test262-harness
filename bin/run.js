#!/usr/bin/env node

// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.
const compile = require('test262-compiler');
const fs = require('fs');
const Path = require('path');
const globber = require('../lib/globber.js');
const argv = require('../lib/cli.js').argv;
const validator = require('../lib/validator.js');
const Rx = require('rx');
const util = require('util');
const resultsEmitter = require('../lib/resultsEmitter.js');
const agentPool = require('../lib/agentPool.js');
const test262Finder = require('../lib/findTest262.js');
const scenariosForTest = require('../lib/scenarios.js');

let reporter;
if (fs.existsSync(Path.join(__dirname, '../lib/reporters', argv.reporter + '.js'))) {
  reporter = require('../lib/reporters/' + argv.reporter + '.js');
} else {
  console.error(`Reporter ${argv.reporter} not found.`);
  process.exit(1);
}

let includesDir = argv.includesDir;
let test262Dir = argv.test262Dir;

// Test Pipeline
const pool = agentPool(Number(argv.threads), argv.hostType, argv.hostArgs, argv.hostPath);
const paths = globber(argv._);
if (!includesDir && !test262Dir) {
  test262Dir = test262Finder(paths.fileEvents[0]);
}
const files = paths.map(pathToTestFile);
const tests = files.map(compileFile);
const scenarios = tests.flatMap(scenariosForTest);
const pairs = Rx.Observable.zip(pool, scenarios);
const rawResults = pairs.flatMap(pool.runTest).tapOnCompleted(() => pool.destroy());;
const results = rawResults.map(function (test) {
  test.result = validator(test);
  return test;
});
const resultEmitter = resultsEmitter(results);
reporter(resultEmitter);

function printVersion() {
    var p = require(path.resolve(__dirname, "..", "package.json"));
    console.log("test262-harness v" + p.version);
}

function pathToTestFile(path) {
  return { file: path, contents: fs.readFileSync(path, 'utf-8')};
}

function compileFile(contents) {
  return compile(contents, { test262Dir: test262Dir, includesDir: includesDir });
}
