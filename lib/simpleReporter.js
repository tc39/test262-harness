var through = require('through');
var readline = require('readline');
var path = require('path');

var state = {
    pass: 0,
    fail: 0,
}

function expectedString(test) {
    if(!test.attrs.negative) {
        return "no error";
    } else {
        return "error matching /" + test.attrs.negative + "/";
    }
}

function actualString(test) {
    if(test.errorStack) {
        return test.errorStack
                   .split("\n")
                   .map(function(v) { return "       " + v.trim()})
                   .join("\n")
                   .trim();
    } else if(test.errorName) {
        if(test.errorMessage) {
            return test.errorName + ": " + test.errorMessage;
        } else {
            return test.errorName;
        }
    } else {
        return "no error"
    }
}

module.exports = through(function(data) {
    if (process.stdout.clearLine && process.stdout.cursorTo) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }

    if(data.pass) {
        state.pass++;
        process.stdout.write("PASS " + path.basename(data.file));
    } else {
        state.fail++;
        data.attrs.file = data.file;
        process.stdout.write("FAIL " + data.file + "\n" +
                             "     " + (data.attrs.description || "").trim() + "\n" +
                             "     Exp: " + expectedString(data) + "\n" +
                             "     Got: " + actualString(data) + "\n\n");
    }
}, function() {
    if (process.stdout.clearLine && process.stdout.cursorTo) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
    console.log("Ran " + (state.pass + state.fail) + " tests")
    console.log(state.pass + " passed")
    console.log(state.fail + " failed")
});
