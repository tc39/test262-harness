'use strict';

const EventEmitter = require('events');
const Rx = require('rxjs');
const tap = require('tap');
const ResultsEmitter = require('../lib/results-emitter');

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
  copyright: '// Copyright (C) 2018 Some Person. All rights reserved.\n// This code is governed by the BSD license found in the LICENSE file.\n',
  rawResult: {},
  result: {
    pass: true
  }
};

tap.test('Subclass of EventEmitter', assert => {
  const subject = new Rx.Subject;
  const emitter = new ResultsEmitter(subject);
  assert.ok(emitter instanceof EventEmitter);
  assert.end();
});

tap.test('complete() emits "end"', assert => {
  const subject = new Rx.Subject();
  const emitter = new ResultsEmitter(subject);

  emitter.on('end', () => {
    assert.ok(true);
    assert.end();
  });

  subject.complete();
});

tap.test('next() emits "start" once, on the first call', assert => {
  const subject = new Rx.Subject();
  const emitter = new ResultsEmitter(subject);

  let counter = 0;
  emitter.on('start', () => counter++);

  emitter.on('end', () => {
    assert.equal(counter, 1);
    assert.end();
  });

  subject.next(fixture);
  subject.next(fixture);
  subject.complete();
});

tap.test('next() emits "pass" when test object is passing', assert => {
  const subject = new Rx.Subject();
  const emitter = new ResultsEmitter(subject);

  emitter.on('pass', test => {
    assert.equal(test, fixture);
    assert.end();
  });

  subject.next(fixture);
});

tap.test('next() emits "fail" when test object is failing', assert => {
  const subject = new Rx.Subject();
  const emitter = new ResultsEmitter(subject);

  emitter.on('fail', test => {
    assert.equal(test, fixture);
    assert.end();
  });

  fixture.result.pass = false;
  subject.next(fixture);
});

tap.test('error() emits "error" when an error occurs', assert => {
  const subject = new Rx.Subject();
  const emitter = new ResultsEmitter(subject);
  const fixture = new Error();

  emitter.on('error', error => {
    assert.equal(error, fixture);
    assert.end();
  });

  subject.error(fixture);
});
