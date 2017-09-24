'use strict';
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const rimraf = require('rimraf');
const tape = require('tape');

const streamTests = require('..').streamTests;
const scenarios = /^(strict mode|default)$/;

const RECORDING = !!process.env.RECORD;

// Properties to exclude when validating metadata. The values are
// inconsequential; they have been selected to aid in discoverability in the
// programatically-generated "expectations" files.
const blankOut = {
  contents: '(The value of this property is over-sized, so it is validated independently.)'
};

function makeDataHandler(t, ids, fixtureDir) {
  const test262Dir = path.join(fixtureDir, 'fake-test262');
  const expectedContentDir = path.join(fixtureDir, 'expected-content');
  const expectedMetadataDir = path.join(fixtureDir, 'expected-metadata');

  if (RECORDING) {
    rimraf.sync(expectedContentDir);
    rimraf.sync(expectedMetadataDir);
  }

  return (test) => {
    if (typeof test !== 'object' || test === null) {
      t.ok(false, 'Emits object values');
      return;
    }

    const actualContents = test.contents;
    const actualMetadata = Object.assign({}, test, blankOut);

    if (!fs.existsSync(path.join(test262Dir, test.file))) {
      t.ok(false, 'Source file does not exist: ' + test.file);
      return;
    }

    // `RegExp.prototype.test` acceptes `undefined`, so an explicit type
    // check is necessary.
    t.equal(typeof test.scenario, 'string', '`scenario` property is a string value');
    t.ok(scenarios.test(test.scenario), '`scenario` property is a valid value');

    const id = test.file.replace(/\.js$/, '_' + test.scenario.replace(' ', '_'));
    const expectedContentFile = path.join(expectedContentDir, id) + '.js';
    const expectedMetadataFile = path.join(expectedMetadataDir, id) + '.json';

    t.not(ids.indexOf(id) === -1, 'Emits each test exactly once');
    ids.push(id);

    if (RECORDING) {
      mkdirp.sync(path.dirname(expectedContentFile));
      fs.writeFileSync(expectedContentFile, actualContents, 'utf-8');
      mkdirp.sync(path.dirname(expectedMetadataFile));
      fs.writeFileSync(expectedMetadataFile, JSON.stringify(actualMetadata, null, 2), 'utf-8');
      return;
    }

    if (!fs.existsSync(expectedContentFile)) {
      t.ok(false, 'Expected content file not found: ' + expectedContentFile);
      return;
    }

    if (!fs.existsSync(expectedMetadataFile)) {
      t.ok(false, 'Expected metadata file not found: ' + expectedMetadataFile);
      return;
    }

    t.deepEqual(actualContents, fs.readFileSync(expectedContentFile, 'utf-8'));
    t.deepEqual(actualMetadata, require(expectedMetadataFile));
  };
}

tape('valid source directory', t => {
  const fixtureDir = path.join(__dirname, 'stream-collateral', 'valid-default');
  const stream = streamTests(path.join(fixtureDir, 'fake-test262'));
  const ids = [];

  stream.on('data', makeDataHandler(t, ids, fixtureDir));

  stream.on('error', (error) => {
    t.ok(error);
    t.end(error);
  });

  stream.on('end', () => {
    t.equal(ids.length, 14, 'Reports every available test');
    t.end();
  });
});

tape('valid source directory (with paths)', t => {
  const fixtureDir = path.join(__dirname, 'stream-collateral', 'valid-with-paths');
  const paths = ['test/bothStrict.js', 'test/strict/no', 'test/async'];
  const stream = streamTests(path.join(fixtureDir, 'fake-test262'), { paths });
  const ids = [];

  stream.on('data', makeDataHandler(t, ids, fixtureDir));

  stream.on('error', (error) => {
    t.ok(error);
    t.end(error);
  });

  stream.on('end', () => {
    t.equal(ids.length, 8, 'Reports every available test');
    t.end();
  });
});


tape('valid source directory (with prelude)', t => {
  const fixtureDir = path.join(__dirname, 'stream-collateral', 'valid-with-prelude');
  const prelude = `// This is a prelude
    'It has some contents';

    /**
     * that
     *   should

     not
     */
     be: () => modified;${ '   ' }

     void "end of prelude";`;
  const stream = streamTests(path.join(fixtureDir, 'fake-test262'), { prelude });
  const ids = [];

  stream.on('data', makeDataHandler(t, ids, fixtureDir));

  stream.on('error', (error) => {
    t.ok(error);
    t.end(error);
  });

  stream.on('end', () => {
    t.equal(ids.length, 2, 'Reports every available test');
    t.end();
  });
});

tape('valid source directory (with custom includes)', t => {
  const fixtureDir = path.join(__dirname, 'stream-collateral', 'valid-with-includes');
  const includesDir = path.join(fixtureDir, 'custom-includes');
  const stream = streamTests(path.join(fixtureDir, 'fake-test262'), { includesDir });
  const ids = [];

  stream.on('data', makeDataHandler(t, ids, fixtureDir));

  stream.on('error', (error) => {
    t.ok(error);
    t.end(error);
  });

  stream.on('end', () => {
    t.equal(ids.length, 2, 'Reports every available test');
    t.end();
  });
});

tape('missing `assert.js`', t => {
  const stream = streamTests(path.join(__dirname, 'stream-collateral', 'invalid-missing-harness'));

  stream.on('data', () => {
    t.end(new Error('Stream should not emit a `data` event'));
  });

  stream.on('end', () => {
    t.end(new Error('Stream should not emit an `end` event'));
  });

  stream.on('error', (error) => {
    t.ok(error, '`error` event should be published with an object');
    t.end();
  });
});

tape.skip('non-existent source directory', t => {
  const stream = streamTests(path.join(__dirname, 'stream-collateral', 'this-directory-does-not-exist'));

  stream.on('data', () => {
    t.end(new Error('Stream should not emit a `data` event'));
  });

  stream.on('end', () => {
    t.end(new Error('Stream should not emit an `end` event'));
  });

  stream.on('error', (error) => {
    t.ok(error, '`error` event should be published with an object');
    t.end();
  });
});
