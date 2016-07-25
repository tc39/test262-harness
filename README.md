## Test262-Harness
An experimental Node-based test262 harness. Once this harness has stabilized, I plan to push to include it by default in official test262.

Requires Node 6 or above.

## Quick Start
1. `git clone https://github.com/tc39/test262.git --depth 1`
2. `npm install -g test262-harness`
3. `test262-harness test262\test\**\*.js --hostType node --hostPath <path to node.exe>`

Run `test262-harness --help` for details on the various configuration options.

## Options

| Name    | Action      |
|------------|---------------|
| --hostType | Type of host to run tests in. See [eshost's supported hosts](https://github.com/bterlson/eshost#supported-hosts) for available options.
| --hostPath | Path to the host executable.
| --hostArgs | Any additional arguments to pass to the host when invoking it (eg. --harmony, --es6all, etc). 
| -t, --threads | Run this many tests in parallel. Note that the browser runners don't work great with t > 1.
| -r, --reporter | Selects test case result format. Currently either `json` or `simple`. Default `simple`.
|--test262Dir | Optional. Root test262 directory and is used to locate the includes directory.
|--includesDir | Includes directory. By default inferred from test262Dir or else detected by walking upward from the first test found.


