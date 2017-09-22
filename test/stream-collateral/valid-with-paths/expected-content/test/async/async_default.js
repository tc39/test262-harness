function Test262Error(message) {
    if (message) this.message = message;
}

Test262Error.prototype.name = "Test262Error";

Test262Error.prototype.toString = function () {
    return "Test262Error: " + this.message;
};

function $ERROR(err) {
  if(typeof err === "object" && err !== null && "name" in err) {
      throw err;
  } else {
    throw new Test262Error(err);
  }
}

function $DONE(err) {
  if (err) {
    if(typeof err === "object" && err !== null && "name" in err) {
      print('test262/error ' + err.name + ': ' + err.message);
    } else {
      print('test262/error Test262Error: ' + err);
    }
  }
  print('test262/done');
  $262.destroy();
}

function $LOG(str) {
  print(str);
}


// This is assert.js

'It has some contents';

/* that
 *
 * should

 * not
 */

`be ${ "modified" }`;

var including, trailing;
whitespace: ;                    

void "end of assert.js";


var p = new Promise(function(resolve) {
  resolve();
});

p.then($DONE, $DONE);
