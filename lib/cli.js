const yargs = require('yargs');
const yargv = yargs
  .usage('Usage: test262-harness [options] <test-file-glob>')
  .demand('hostType')
  .describe('hostType', 'eshost host type (chakra, d8, jsshell, chrome, firefox, etc.)')
  .describe('hostPath', 'path to eshost host binary')
  .describe('hostArgs', 'command-line arguments to pass to eshost host')
  .describe('test262Dir', 'test262 root directory')
  .describe('includesDir', 'directory where helper files are found')
  .describe('threads', 'number of threads to use')
  .default('threads', 1)
  .help('help')
  .example('test262-harness path/to/test.js')

exports.argv = yargv.argv;
