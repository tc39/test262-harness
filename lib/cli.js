const { supportedHosts } = require("eshost");
const yargs = require('yargs');
const yargv = yargs
  .strict()
  .usage('Usage: test262-harness [options] <test-file-glob>')
  .describe('hostType', `eshost host type (${supportedHosts.join(", ")}, etc.)`)
  .describe('hostPath', 'path to eshost host binary')
  .describe('hostArgs', 'command-line arguments to pass to eshost host')
  .describe('test262Dir', 'test262 root directory')
  .describe('includesDir', 'directory where helper files are found')
  .describe('tempDir', 'directory that eshost will create its temp files in (does not affect location of files created by --saveCompiledTests and --saveOnlyFailed')
  .describe('threads', 'number of threads to use')
  .describe('prelude', 'content to include above each test; supports multiple --prelude parameters')
  .describe('version', 'print version of test262-harness')
  .alias('version', 'v')
  .describe('features', 'comma-separated list of features to filter for')
  .nargs('features', 1)
  .alias('features', 'f')
  .describe('transformer', 'path to module which exports a code transformer function')
  .describe('preprocessor', 'path to module which exports a map function that operates on each Test262Test object before it executed')
  .nargs('prelude', 1)
  .nargs('threads', 1)
  .default('threads', 1)
  .alias('threads', 't')
  .describe('reporter', 'format of data written to standard output')
  .choices('reporter', ['simple', 'json'])
  .nargs('reporter', 1)
  .alias('reporter', 'r')
  .default('reporter', 'simple')
  .describe('reporter-keys', 'comma-separated list of keys to include in JSON ouput')
  .help('help')
  .alias('help', 'h')
  .describe('timeout', 'test timeout (in ms, default 10000)')
  .nargs('timeout', 1)
  .describe('acceptVersion', 'override for supported Test262 version')
  .boolean('saveCompiledTests')
  .describe('saveCompiledTests', 'Write the compiled version of path/to/test.js as path/to/test.js.<hostType>.<default|strict>.<pass|fail> so that it can be easily re-run under that host')
  .boolean('saveOnlyFailed')
  .describe('saveOnlyFailed', 'Only save the compiled version of the test if it failed, to help easily repro failed tests (implies --saveCompiledTests)')
  .example('test262-harness path/to/test.js')
  .example('test262-harness --hostType ch --hostPath path/to/host path/to/test262/test/folder/**/*.js')
  .example('test262-harness --hostType ch --hostPath path/to/host --saveCompiledTests path/to/test262/test/folder/**/*.js')
  .example('test262-harness --hostType ch --hostPath path/to/host --saveOnlyFailed path/to/test262/test/folder/**/*.js')
  .fail((msg, err) => {
    if (err) {
      console.error(err.stack);
    } else {
      console.error(msg);
    }
    process.exit(1);
  });

exports.argv = yargv.argv;
exports.showHelp = () => yargv.showHelp();
