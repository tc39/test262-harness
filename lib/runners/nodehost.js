var vm = require('vm');

function Test262Error(message) {
    if (message) this.message = message;
}

Test262Error.prototype.toString = function () {
    return "Test262Error: " + this.message;
};

process.stdin.resume();
process.stdin.on('data', function(test) {
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
});
