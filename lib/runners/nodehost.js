var vm = require('vm');

function Test262Error(message) {
    if (message) this.message = message;
}

Test262Error.prototype.toString = function () {
    return "Test262Error: " + this.message;
};

function runTest(test) {
    var result = { log: [] }
    var context = {
        $ERROR: function(err) {
            if(typeof err === "object" && err !== null && "name" in err)
                throw err;
            else throw new Test262Error(err);
        },
        $DONE: function(error) {
            if(error) {
                if(typeof error === 'object') {
                    if(error.hasOwnProperty('stack')) {
                        console.log("test262/error " + error.stack);
                    } else {
                        console.log("test262/error " + (error.name || "Test262Error")  + ": " + error.message);
                    }
                } else {
                    console.log('test262/error Error: ' + error);
                }
            }
            console.log('test262/done');
        },
        $LOG: function(log) {
            console.log(log);
        },
        process: process,
        Test262Error: Test262Error
    }

    try {
        vm.runInNewContext(test, context, {displayErrors: false});
    } catch(e) {
        context.$DONE(e);
    }
}

/**
 * Collect data emitted by a stream into "whole" strings (as defined according
 * to the presence of some delimiter), and invoke the provided callback with
 * each.
 *
 * @param {ReadableStream} stream
 * @param {string} delimter
 * @param {function} onComplete - invoked asynchronously with each "whole"
 *                                value as the second argument; in the event of
 *                                and error, invoked with the error as the
 *                                first argument
 */
function collectChunks(stream, delimiter, onComplete) {
    var buffer = '';
    stream.on('data', function(chunk) {
        var parts;
        buffer += chunk.toString();

        parts = buffer.split(delimiter);

        buffer = parts.pop();

        // If `parts` has any elements, they are fully-formed values
        parts.forEach(function(whole) {
            setTimeout(onComplete.bind(null, null, whole), 0);
        });
    });

    stream.on('error', function(error) {
        onComplete(error);
    });
}

/**
 * A stream is used here because the system architecture dictates a process
 * boundary, and standard in/out is the most natural way to conduct
 * inter-process communication.
 *
 * Streams are a sub-optimal transport mechanism for test files because the
 * data cannot be meaningfully decomposed into smaller pieces. The runtime may
 * choose to segment large payloads into any arbitrary number of chunks, so no
 * guarantees can be made about the completeness of a given chunk emitted in a
 * `data` event.
 *
 * Use a simple delimiter-based protocol to ensure that the host only attempts
 * to execute fully-formed tests.
 */
process.stdin.resume();
collectChunks(process.stdin, '<< test262-harness end of test >>', function(err, test) {
    runTest(test);
});
