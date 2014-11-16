var vm = require('vm');

process.on('message', function(test) {
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
                    // custom thrown errors won't have a name property.
                    result.errorName = error.name || "Test262Error";
                    result.errorMessage = error.message;
                    result.errorStack = error.stack
                } else {
                    result.errorName = error;
                }
            }
            result.doneCalled = true;
            process.send(result);
        },
        $LOG: function(log) {
            result.log.push(log);
        }
    }

    try {
        vm.runInNewContext(test, context);
    } catch(e) {
        context.$DONE(e);
    }
})
