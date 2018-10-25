'use strict';

const tap = require('tap');
const validator = require('../lib/validator');

const fixture = {
  file: 'foo.js',
  contents: '1+1;',
  attrs: {
    esid: 'sec-foo',
    description: 'Foo. (Strict Mode)',
    info: 'Foo',
    includes: ['assert.js'],
    flags: {

    }
  },
  copyright: '// Copyright (C) 2017 Some Person. All rights reserved.\n// This code is governed by the BSD license found in the LICENSE file.\n',
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
  const validated = validator(test);
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Test timed out');
  assert.end();
});

tap.test('stderr reported', assert => {
  const rawResult = {
    stderr: '/foo/bar/node: bad option: --bogus_v8_option\n',
    stdout: '',
    error: null
  };

  const validated = validator(Object.assign({}, fixture, { rawResult }));
  assert.equal(validated.pass, false);
  assert.equal(validated.message, '/foo/bar/node: bad option: --bogus_v8_option\n');
  assert.end();
});

tap.test('failure, stderr has the contents', assert => {
  const rawResult = {
    stderr: 'Segmentation Fault\n',
    stdout: '',
    error: null
  };

  const validated = validator(Object.assign({}, fixture, { rawResult }));
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Segmentation Fault\n');
  assert.end();
});

tap.test('failure, stdout has the contents', assert => {
  const rawResult = {
    stderr: '',
    stdout: 'Segmentation Fault\n',
    error: null
  };

  const validated = validator(Object.assign({}, fixture, { rawResult }));
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Segmentation Fault\n');
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
  const validated = validator(test);
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Some Test262Error Error');
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
  const validated = validator(test);
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Expected no error, got SyntaxError: Some SyntaxError Error');
  assert.end();
});

tap.test('attrs.flags.async: true (pass)', assert => {
  const rawResult = {
    stderr: '',
    stdout: 'Test262:AsyncTestComplete',
    error: null,
  };

  const attrs = Object.assign({}, fixture.attrs, {
    flags: {
      async: true,
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validated = validator(test);
  assert.equal(validated.pass, true);
  assert.equal(validated.message, undefined);
  assert.end();
});

tap.test('attrs.flags.async: true (fail)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: {
      name: 'RangeError',
      message: 'Something bad happened... asynchronously'
    },
  };

  const attrs = Object.assign({}, fixture.attrs, {
    flags: {
      async: true,
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validated = validator(test);
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Expected no error, got RangeError: Something bad happened... asynchronously');
  assert.end();
});

tap.test('attrs.flags.async: true (fail, but no output)', assert => {
  const rawResult = {
    stderr: '',
    stdout: '',
    error: null,
  };

  const attrs = Object.assign({}, fixture.attrs, {
    flags: {
      async: true,
    }
  });

  const test = Object.assign({}, fixture, { attrs, rawResult });
  const validated = validator(test);
  assert.equal(validated.pass, false);
  assert.equal(validated.message, 'Test did not run to completion');
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
