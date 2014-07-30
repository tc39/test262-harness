var through = require('through');
var readline = require('readline');
var util = require('util');
var path = require('path');
module.exports = through(function(data) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if(data.pass) {
        process.stdout.write("PASS " + path.basename(data.file));
    } else {
        data.attrs.file = data.file;
        process.stdout.write("FAIL\t" + data.error + ": " + data.errorMessage + "\n");
        process.stdout.write("\t" + util.inspect(data.attrs).replace(/\n/g, "\n\t") + "\n");
    }
}, function() {
    process.stdout.clearLine();
});
