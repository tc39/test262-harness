var through = require('through');
var readline = require('readline');
var util = require('util');
var path = require('path');

var state = {
    pass: 0,
    fail: 0,
}

module.exports = through(function(data) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if(data.pass) {
        state.pass++;
        process.stdout.write("PASS " + path.basename(data.file));
    } else {
        state.fail++;
        data.attrs.file = data.file;
        process.stdout.write("FAIL\t"
                             + data.errorName
                             + (data.errorMessage ? ": " + data.errorMessage : "")
                             + "\n");
        process.stdout.write("\t" + util.inspect(data.attrs).replace(/\n/g, "\n\t") + "\n");
    }
}, function() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log("Ran " + (state.pass + state.fail) + " tests")
    console.log(state.pass + " passed")
    console.log(state.fail + " failed")
});
