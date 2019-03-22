## Test262-Harness

[![Travis Build Status](https://travis-ci.org/bterlson/test262-harness.svg?branch=master)](https://travis-ci.org/bterlson/test262-harness)

## Test Authoring Quick Start

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

| Option Name | Description | Required | Default |
| -- | -- | -- | -- |
| `-h`, `--help` | Show help & examples | n/a | n/a |
| `-v`, `--version` | Print the current version of test262-harness | n/a | n/a |
| `--hostType` | Type of host to run tests in. See [eshost's supported hosts](https://github.com/bterlson/eshost#supported-hosts) for available options. | No | `node`
| `--hostPath` | Path to the host executable. | Yes, if `hostType` is specified | `process.execPath` 
| `--hostArgs` | Any additional arguments to pass to the host when invoking it (eg. `--harmony`, `--es6all`, etc). | No | n/a |
| `-t`, `--threads` | Run this many tests in parallel. Note that the browser runners don't work great with t > 1. | No | 1 |
| `-r`, `--reporter` | Format of data written to standard output. Currently either `json` or `simple`. | No |  `simple` |
| `--features` | Comma-separated list of [`features`](https://github.com/tc39/test262/blob/master/features.txt) to filter for. Example: `--features="BigInt,Atomics"`. | No | n/a |
| `--reporter-keys` | Comma-separated list of keys to include in output of `json` reporter. | No | n/a |
| `--test262Dir` | Root test262 directory and is used to locate the includes directory. | No | Relative to test files |
| `--includesDir` | Includes directory. | No | Inferred from `test262Dir` or else detected by walking upward from the first test found. |
| `--tempDir` | Directory that `eshost` will create its temp files in (does not affect location of files created by `--saveCompiledTests` and `--saveOnlyFailed` | No | OS Temp Dir |
| `--prelude` | Path to a file to include before every test (useful for testing polyfills for example); supports multiple `--prelude` parameters | No | n/a |
| `--timeout` | Set a custom test timeout in milliseconds | No | `10000` |
| `--transformer` | Path to module which exports a code transformer function | No | n/a |
| `--preprocessor` | Path to module which exports a map function that operates on each Test262Test object before it executed. | No | n/a |
| `--acceptVersion` | Execute tests from a version of Test262 that differs from the versions supported by this utility. This may cause the utility to report invalid test results. | No | Inferred from `test262Dir/package.json` |
| `--saveCompiledTests` | Write the compiled version of `path/to/test.js` as `path/to/test.js.<hostType>.<default\|strict>.<pass\|fail>` so that it can be easily re-run under that host. Run `test262-harness --help` for examples. | No | n/a 
| `--saveOnlyFailed` | Only save the compiled version of the test if it failed, to help easily repro failed tests (implies `--saveCompiledTests`). | No | n/a 

### Preprocessor

The `--preprocessor` feature allows patching a module that exports a map function that operates on each Test262Test object before their execution.

Using the preprocessor feature, each Test262Test object can be returned with an added property `result` that sets an autofail mode. This will skip the code evaluation and report the given result object.

This can be useful for code transforming and/or test filtering. e.g.:

```js
module.exports = function(test) {
  try {
    test.contents = babel.transform(test.contents, options).code;
  } catch (error) {
    test.result = {
      stderr: 'Test262: This is a fake error.\n',
      stdout: '',
      error: {
        name: 'Test262',
        message: 'This is a fake error.'
      }
    };
  }

  return test;
};
```
