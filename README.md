## Test262-Harness
An experimental Node-based test262 harness. Once this harness has stabilized, I plan to push to include it by default in official test262.

Note that this harness requires the normalized test262 format currently proposed in http://github.com/tc39/test262/pulls/51.

### Running tests
1. Clone the repository
2. `npm install`
3. `node bin\run.js <glob of files to match>`

### Example
Run chapter 8 tests:

`> node bin\run.js ../test262/test/suite/ch08/**/*.js`

#### Options
| Name    | Action      |
|------------|---------------|
| --runner | Selects a runner to use. Currently available are `node` and `console`
| --consoleCommand | For console runner, sets the command to invoke. Must be in PATH.
| --consolePrintCommand | For console runner, sets the command to write to console. Used for reporting errors to the harness.
| --testStrict | Tests both strict and non-strict mode (note: many tests need fixing for this to work)
| --reporter | Selects test case result format. Currently either `json` or `tap`. Default `tap`.

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
