const yargs = require('yargs');
const yargv = yargs
  .strict()
  .usage('Usage: test262-harness [options] <test-file-glob>')
  .describe('hostType', 'eshost host type (ch, d8, jsshell, chrome, firefox, etc.)')
  .describe('hostPath', 'path to eshost host binary')
  .describe('hostArgs', 'command-line arguments to pass to eshost host')
  .describe('test262Dir', 'test262 root directory')
  .describe('includesDir', 'directory where helper files are found')
  .describe('threads', 'number of threads to use')
  .describe('prelude', 'content to include above each test')
  .describe('version', 'print version of test262-harness')
  .alias('version', 'v')
  .describe('features', 'comma-separated list of features to filter for')
  .nargs('features', 1)
  .alias('features', 'f')
  .describe('babelPresets', 'Babel presets used to transpile code')
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
  .describe('saveCompiledTests', 'Write the compiled version of path/to/test.js as path/to/test.<hostType>.js so that it can be easily re-run under that host')
  .boolean('saveOnlyFailed')
  .describe('saveOnlyFailed', 'Only save the compiled version of the test if it failed, to help easily repro failed tests (requires --saveCompiledTests)')
  .example('test262-harness path/to/test.js')
  .example('test262-harness --hostType ch --hostPath path/to/ch.exe path/to/test262/test/folder/**/*.js')
  .example('test262-harness --hostType ch --hostPath path/to/ch.exe --saveCompiledTests --saveOnlyFailed path/to/test262/test/folder/**/*.js')
  .fail(function (msg, err) {
    if (err) {
      console.error(err.stack);
    } else {
      console.error(msg);
    }
    process.exit(1);
  });

exports.argv = yargv.argv;
exports.showHelp = () => yargv.showHelp();
