## Test262-Harness
An experimental Node-based test262 harness. Once this harness has stabilized, I plan to push to include it by default in official test262.

Note that this harness requires the normalized test262 format currently proposed in <http://github.com/tc39/test262/pull/51>.

### Running tests
1. Clone the repository
2. `npm install`
3. `node bin\run.js <glob of files to match>`

### Example
Run chapter 8 tests:

`> test262-harness ../test262/test/suite/ch08/**/*.js`
`> test262-harness -e jsshell/js -p print ./tests`
`> test262-harness --prelude promise.js ./tests/es6/ch25/**/*.js`

#### Options
| Name    | Action      |
|------------|---------------|
| -r, --runner | Selects a runner to use. Currently available are `node` and `console`
| -e, --consoleCommand | For console runner, sets the command to invoke. Must be in PATH.
| -p, --consolePrintCommand | For console runner, sets the command to write to console. Used for reporting errors to the harness.
| -t, --threads | Run this many tests in parallel.
| --testStrict | Tests both strict and non-strict mode (note: many tests need fixing for this to work)
| -R, --reporter | Selects test case result format. Currently either `json`, `tap`, or `simple`. Default `simple`.
| --prelude | Appends specified file to the top of each test file.

### Pipeline

The tests are passed through the following pipeline:

#### Parse
The parser (`lib\parser.js`) takes raw test collateral in the form of `{file: "relative/path/to/file", contents: "test contents"}` and emits a parsed test that includes parsed frontmatter and other metadata.

#### Compile
Each runner can provide a compile step that is responsible for building the test contents required to execute the test under that particular host. The compiler takes the output of the parser and returns an iterator that iterates over test artifacts that are run individually. Compilers can typically just inherit the default compiler implementation found in `lib\runner.js`.

### Run
Each runner provides a run method that is responsible for running the test in the particular host. It takes each test from the compiler, runs it, and reports any errors.

### Results
At this point results can be printed in JSON or TAP formats.
