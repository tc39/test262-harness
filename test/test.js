var test = require('tape');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');

run()
.then(validate)
.catch(reportRunError)

function validate(records) {
  records.forEach(record => {
    test(record.attrs.description, function (t) {
      t.assert(record.attrs.expected, 'Test has an `expected` frontmatter');
      if (!record.attrs.expected) {
        // can't do anything else
        t.end();
        return;
      }

      t.equal(record.result.pass, record.attrs.expected.pass, 'Test passes or fails as expected');
      
      if (record.attrs.expected.message) {
        t.equal(record.result.message, record.attrs.expected.message, 'Test fails with appropriate message');
      }

      t.end();
    });
  });
}

function reportRunError(e) {
  console.error("Error running tests", e.stack);
  process.exit(1);
}

function run() {
  return new Promise((resolve, reject) => {
    var stdout = '';
    var stderr = '';

    var child = cp.fork('bin/run.js', [
      '--hostType', 'node',
      '--hostPath', process.execPath,
      '-r', 'json',
      '--includesDir', './test/test-includes',
      'test/collateral/**/*.js'], {silent: true});

    child.stdout.on('data', function(d) { stdout += d });
    child.stderr.on('data', function(d) { stderr += d });
    child.on('exit', function() {
      if (stderr) {
        return reject(new Error("Got stderr: " + stderr));
      }

      try {
        resolve(JSON.parse(stdout));
      } catch(e) {
        reject(e);
      }
    })
  });
}

