'use strict';
const TestStream = require('./test-stream');

/**
 * Create a Node.js readable stream that emits an object value for every test
 * in a given filesystem directory. This object has the following properties:
 *
 * - file {string} - the absolute path to the file from which the test was
 *                   derived
 * - contents {string} - the complete source text for the test; this contains
 *                       any "includes" files specified in the frontmatter,
 *                       "prelude" content if specified (see below), and any
 *                       "scenario" transformations
 * - attrs {object} - an object representation of the metadata declared in the
 *                    test's YAML-formatted "frontmatter" section
 * - copyright {string} - the licensing information included within the test
 *                        (if any)
 * - scenario {string} - name describing how the source file was interpreted to
 *                       create the test
 * - async {boolean} - *deprecated*; an unreliable indicator of whether the
 *                     test describes asynchronous behavior; this information
 *                     is consistently available in the `async` metadata flag
 * - isATest {boolean} - *deprecated*; an unreliable indicator of whether the
 *                       object describes a test; all emitted values describe
 *                       tests
 * - strictMode {boolean} - *deprecated*; indicator of whether a global "use
 *                          strict" directive was inserted into the contents;
 *                          this does *not* definitely describe the strictness
 *                          of the code
 *
 * @param {string} test262Dir - filesystem path to a directory containing
 *                              Test262
 * @param {object} [options]
 * @param {string} [options.includesDir] - directory from which to load
 *                                         "includes" files (defaults to the
 *                                         appropriate subdirectory of the
 *                                         provided `test262Dir`
 * @param {Array<string>} [options.paths] - file system paths refining the set
 *                                          of tests that should be produced;
 *                                          only tests whose source file
 *                                          matches one of these values (in the
 *                                          case of file paths) or is contained
 *                                          by one of these paths (in the case
 *                                          of directory paths) will be
 *                                          created; all paths are interpreted
 *                                          relative to the root of the
 *                                          provided `test262Dir`
 * @param {string} [options.prelude] - string contents to inject into each
 *                                     test that does not carry the `raw`
 *                                     metadata flag; defaults to the empty
 *                                     string (e.g. no injection)
 *
 * @returns {object} readable stream
 */
exports.streamTests = function(test262Dir, options) {
  return new TestStream(test262Dir, options);
};
