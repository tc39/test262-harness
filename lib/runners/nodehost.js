var vm = require('vm');

process.stdin.resume();
process.stdin.on('data', function(testJSON) {
    var test = JSON.parse(testJSON);
    var result = { log: [] }
    var context = {
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
        process: process
    };

    try {
        vm.runInNewContext(test.contents, context, {displayErrors: false});

        if (test.attrs.flags.raw) {
          context.$DONE();
        }
    } catch(e) {
        context.$DONE(e);
    }
});
