const tap = require('tap');
const validator = require('../lib/validator');

const fixture = {
  file: 'foo.js',
  contents: '$DONE();',
  attrs: {
    esid: 'sec-foo',
    description: 'Foo. (Strict Mode)',
    info: 'Foo',
    includes: ['assert.js'],
    flags: {}
  },
  async: false,
  copyright: '// Copyright (C) 2017 Some Person. All rights reserved.\n// This code is governed by the BSD license found in the LICENSE file.\n',
  isATest: true,
  strictMode: false,
  rawResult: {}
};

tap.test('timeout reported', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: null,
    timeout: true
  };
  const test = Object.assign({}, fixture, { rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Test timed out');
  assert.end();
});

tap.test('stderr reported', assert => {
  const rawResult = {
    stderr: '/foo/bar/node: bad option: --bogus_v8_option\n',
    stdout: '',
    error: null
  };

  const validation = validator(Object.assign({}, fixture, { rawResult }));
  assert.equal(validation.pass, false);
  assert.equal(validation.message, '/foo/bar/node: bad option: --bogus_v8_option\n');
  assert.end();
});

tap.test('Test262Error reported', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: {
      name: 'Test262Error',
      message: 'Some Test262Error Error'
    },
  };
  const test = Object.assign({}, fixture, { rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Some Test262Error Error');
  assert.end();
});

tap.test('Expecting no error reported', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: {
      name: 'SyntaxError',
      message: 'Some SyntaxError Error'
    },
  };
  const test = Object.assign({}, fixture, { rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Expected no error, got SyntaxError: Some SyntaxError Error');
  assert.end();
});

tap.test('Ran to finish (pass)', assert => {
  const rawResult = {
    stderr: '',
    stdout: 'test262/done',
    error: null,
  };
  const test = Object.assign({}, fixture, { rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, true);
  assert.equal(validation.message, undefined);
  assert.end();
});

tap.test('attrs.flags: negative (pass)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: 'Some error message that is not known',
  };

  const attrs = Object.assign({}, fixture.attrs, {
    flags: {
      negative: true,
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, true);
  assert.equal(validation.message, undefined);
  assert.end();
});

tap.test('attrs.flags: negative (fail)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: null,
  };

  const attrs = Object.assign({}, fixture.attrs, {
    flags: {
      negative: true,
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Expected test to throw some error');
  assert.end();
});

tap.test('attrs.negative (pass)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: {
      name: 'RangeError'
    },
  };

  const attrs = Object.assign({}, fixture.attrs, {
    negative: {
      phase: 'runtime',
      type: 'RangeError',
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, true);
  assert.equal(validation.message, undefined);
  assert.end();
});

tap.test('attrs.negative no error (fail)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: null,
  };

  const attrs = Object.assign({}, fixture.attrs, {
    negative: {
      phase: 'runtime',
      type: 'RangeError',
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Expected test to throw error of type RangeError, but did not throw error');
  assert.end();
});

tap.test('attrs.negative wrong error (fail)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: {
      name: 'SyntaxError'
    },
  };

  const attrs = Object.assign({}, fixture.attrs, {
    negative: {
      phase: 'runtime',
      type: 'RangeError',
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validation = validator(test);
  assert.equal(validation.pass, false);
  assert.equal(validation.message, 'Expected test to throw error of type RangeError, got SyntaxError: undefined');
  assert.end();
});
