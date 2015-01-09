var vm = require('vm');

process.stdin.resume();
process.stdin.on('data', function(test) {
    var result = { log: [] }
    var error;
    var context = {
        $ERROR: function(err) {
            error = err;
        },
        $DONE: function(err) {
            if(err) context.$ERROR(err);
            if(error) {
                if(typeof error === 'object') {
                    if(error.hasOwnProperty('stack')) {
                        console.log("test262/error " + error.stack);
                    } else {
                        console.log("test262/error " + (error.name || Test262Error)  + ": " + error.message);
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
        process: process
    }

    try {
        vm.runInNewContext(test, context, {displayErrors: false});
    } catch(e) {
        context.$DONE(e);
    }
});
