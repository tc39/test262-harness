## Test262-Harness

An experimental Node-based test262 harness. Once this harness has stabilized, I plan to push to include it by default in official test262.

Requires Node 6 or above.

## Quick Start

1. Clone **test262** locally:
    ```
    git clone https://github.com/tc39/test262.git --depth 1
    cd test262
    ```
2. Install **test262-harness**: 
    ```
    npm install -g test262-harness
    ```
3. Run some tests!
    ```
    test262-harness test/**/*.js
    ```

Run `test262-harness --help` for details on the various configuration options.

## Options

| Name    | Action      |
|------------|---------------|
| `--hostType` | Type of host to run tests in. See [eshost's supported hosts](https://github.com/bterlson/eshost#supported-hosts) for available options.
| `--hostPath` | Path to the host executable.
| `--hostArgs` | Any additional arguments to pass to the host when invoking it (eg. `--harmony`, `--es6all`, etc). 
| `-t`, `--threads` | Run this many tests in parallel. Note that the browser runners don't work great with t > 1.
| `-r`, `--reporter` | Format of data written to standard output. Currently either `json` or `simple`. Default `simple`.
|`--reporter-keys` | Comma-separated list of keys to include in output of `json` reporter.
|`--test262Dir` | Optional. Root test262 directory and is used to locate the includes directory.
|`--includesDir` | Includes directory. By default inferred from test262Dir or else detected by walking upward from the first test found.
|`--prelude` | Path to a file to include before every test (useful for testing polyfills for example)
|`--timeout` | Set a custom test timeout (in ms, default 10000)
|`-v`, `--version` | Print the current version of test262-harness
|`--babelPresets` | Babel presets used to transpile code. E.g.: `stage-2`, `stage-3`
|`-h`, `--help` | Show help

## Note.js API

This module also defines a JavaScript API in Node.js.

```js
var testStream = require('test262-harness').testStream;
var stream = streamTests('/path/to/test262', {
    // Directory from which to load "includes" files (defaults to the
    // appropriate subdirectory of the provided `test262Dir`
    // Optional. Defaults to './harness'
    includesDir: '/path/to/includes/dir',

    // File system paths refining the set of tests that should be produced;
    // only tests whose source file matches one of these values (in the case of
    // file paths) or is contained by one of these paths (in the case of
    // directory paths) will be created; all paths are interpreted relative to
    // the root of the provided `test262Dir`
    // Optional. Defaults to ['test']
    paths: ['test/built-ins/eval', 'test/language/statements/empty/S12.3_A1.js'],

    // String contents to inject into each test that does not carry the "raw"
    // metadata flag
    // Optional. Defaults to the empty string.
    prelude: 'void void void 0;'
  });

stream.on('data', function(test) {
    // the absolute path to the file from which the test was derived
    console.log(test.file);

    // the complete source text for the test; this contains any "includes"
    // files specified in the frontmatter, "prelude" content if specified (see
    // below), and any "scenario" transformations
    console.log(test.contents);

    // an object representation of the metadata declared in the test's
    // "frontmatter" section
    console.log(test.attrs);

    // the licensing information included within the test (if any)
    console.log(test.copyright);

    // name describing how the source file was interpreted to create the test
    console.log(test.scenario);

    // *deprecated*; an unreliable indicator of whether the test describes
    // asynchronous behavior; this information is consistently available in the
    // `async` metadata flag
    console.log(async);

    // *deprecated*; an unreliable indicator of whether the object describes a
    // test; all emitted values describe tests
    console.log(test.isATest);

    // *deprecated*; indicator of whether a global "use strict" directive was
    // inserted into the contents; this does *not* definitely describe the
    // strictness of the code
    console.log(test.strictMode);
  });

stream.on('end', function() {
    console.log('No further tests.');
  });

stream.on('error', function(err) {
    console.error('Something went wrong:', err);
  });
```
