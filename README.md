## Test262-Harness
An experimental Node-based test262 harness. Once this harness has stabilized, I plan to push to include it by default in official test262.

## Quick Start
1. `npm install test262-harness`
2. `./node_modules/.bin/test262-harness glob/of/test262/tests/to/run`

If you need the official test262 collateral:

`git clone https://github.com/tc39/test262.git --depth 1`

### Examples
Run language tests in the default runner (Node):

`> test262-harness "../test262/test/language/**/*.js"`

Using -T, collateral paths are relative to the test262 root directory:

`> test262-harness -T ~/test262 language/**/*.js`

When a glob matches a directory, the default behavior will run all .js files under it recursively:

`> test262-harness -T ~/test262 language`

Run local tests in jsshell:

`> test262-harness -r jsshell -e jsshell/js -b ./tests`

Run promise tests on a promise polyfill:

`> test262-harness --prelude promise.js "./tests/es6/ch25/**/*.js"`


## Options
These options may be passed on the command line or passed to useConfig in your config file (see below).

| Name    | Action      |
|------------|---------------|
| -r, --runner | Selects a runner to use. Currently available are `node`, `node-ip`, `jsshell`, and `console`. Config files may also pass a runner constructor whose instances implement the runner API described below.
| -c, --config | Load a config.js file
| -C, --compile | Save compiled tests so they can be run directly in the host without the harness. Can specify either "all" or "failures". Default is "all".
| -o, --outputDir | Output directory for compiled test collateral
| -e, --consoleCommand | For console runner, sets the command to invoke. Must be in PATH.
| -p, --consolePrintCommand | For console runner, sets the command to write to console. Used for reporting errors to the harness.
| -t, --threads | Run this many tests in parallel.
| -b, --batch | How many tests to batch together. Only supported by some runners (currently just jsshell)
| --testStrict | Tests both strict and non-strict mode (note: many tests need fixing for this to work)
| -R, --reporter | Selects test case result format. Currently either `json`, `tap`, or `simple`. Default `simple`.
| --prelude | Appends specified file to the top of each test file.
| -T, --test262Dir | Root test262 directory. When used, globs are relative to the test262Dir/test.


## Config File
You can store configuration options or implement a custom runner in a config file. For example, given the following `t262.js` file:

```javascript
var t262 = require('test262-harness');
t262.useConfig({
    batch: 50,
    consoleCommand: 'js.exe',
    runner: 'jsshell'
})
```

the command `test262-harness -c t262.js ../test262/test/suite/**/*.js` will run all of test262 in jsshell.

You may also pass in an array of test globs you wish to exclude from running under 'exclude' property in config. For example, this will exclude all tests in chapter 8 from running:

```javascript
t262.useConfig({
    exclude: ["../test262/test/suite/ch08/**/*.js"]
})
```

## Runners
This harness is capable of running tests out of the box on a number of different hosts. Today these include Node, jsshell, and generic console hosts. You can also subclass any of these runners to provide custom behavior, for example to support transpilation tools. See the Runner API below for more details on how to do this.

Different runners may execute tests in different ways. The two basic methods are "normal" mode and "batch" mode. In normal mode, only one test is sent to the runner at a time, while in batch mode a configurable number is sent at once. Batch mode is signficantly more efficient in certain cases (for example, with the jsshell runner).  Either mode may run tests in-process (the node-ip runner) or out-of-proc (every other runner). The following table describes the various runners and their capabilities.

| Runner | Name | Description |
|--------|------|-------------|
| out-of-proc node | `node` | Uses child\_process.fork() to run tests out-of-proc. The out-of-proc host uses vm.runInNewContext to provide isolation between tests. Default runner.
| in-proc node | `node-ip` | Runs the test in the current process using vm.runInNewContext.
| console | `console` | Runs tests out-of-proc in a generic console host. Works with Node, JSShell, and probably others. You will have to provide -p for normal mode runs (defaults to console.log). Can enable batch mode behavior by providing the createEnv and runBatched configuration options.
| jsshell | `jsshell` | Subclass of the console runner with defaults for jsshell

## Debugging Test Failures
Because test262-harness makes significant modifications to a test before ultimately running it, even stack traces are little help when debugging test262 failures. In these cases, the --compile flag is your friend. By passing "--compile failures -o output" to the harness, fully compiled failing tests will be written to disk under the output directory. You can run these files directly in the host you are testing.

## API

### Test262

#### useConfig(config)
Adds the provided configuration object to the current configuration.

```js
var t262 = require('test262-harness');
t262.useConfig({batch: 50});
t262.useConfig({runner: 'jsshell'}); // may be called many times
```

#### Runner(config)
The runner base constructor. Provides default implementations for much of the compilation pipeline. See below for details.

```js
var t262 = t262.Runner
```

#### ConsoleRunner(config)
The console runner base constructor. Provides default implementations for suitable for most console hosts.

#### NodeRunner(config)
The out-of-proc node runner constructor

#### JSShellRunner(config)

The JSShell runner constructor.

### Runners
All runners have the same basic interface. Supporting new hosts, transpilers, or test mutations can be accomplished by writing a new runner subclass.

#### Runner(args)
Runners are constructed by passing the current configuration object.

#### Runner.prototype.needsCtrlFlow
Boolean flag indicating whether control-flow-related code should be injected during test compilation (see `Runner.prototype.compile`).

#### Runner.prototype.compile(test)
Modifies the test contents to run in the target host. By default, it will append a call to $DONE if not already present, append the appropriate environment dependencies (eg. `$DONE`, `$LOG`, `$ERROR`, etc), append helpers, and add "use strict" if required.

#### Runner.prototype.link(test)
Recursively appends helpers required in the front-matter of the test.

#### Runner.prototype.validateResult(test, result)
Sets test.pass to true or false depending on if the result is expected.

Result can have the following keys:
* **errorString**: Error of the form ErrorName: ErrorMessage.
* **log**: An array of log strings.
* **doneCalled**: boolean indicating whether $DONE was called by the test.
* **errorName**: name of error thrown (if any)
* **errorMessage**: message from error thrown (used for debugging purposes)
* **errorStack**: stack trace of error thrown (used for debugging purposes)

You will not specify all of the result keys at once. If running in-proc, you will likely pass doneCalled, errorName, errorMessage, and errorStack as you will have the actual error object and you can pull these off. If running out-of-proc, you will be serializing and deserializing test results, so you may just have log strings collected from stdout and maybe an errorString parsed from stderr depending on the test is run.

#### Runner.prototype.run(test, done)
Compiles and executes the test. Call done when the test has finished running.

#### Runner.prototype.runBatch(tests, batchDone)
Takes an array of tests to run and compiles and executes each. Call batchDone once the entire batch is completed.

#### Runner.prototype.execute(test, done)
Takes a fully compiled test ready to be executed in the target host, executes it, and validates the results. Call done when the test has finished executing.

#### Runner.prototype.executeBatch(batch, done)
Takes a fully compiled batch of tests and executes them in the target host, validating each result. Call done when the entire batch has finished executing.
