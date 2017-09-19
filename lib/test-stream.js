'use strict';
const Readable = require('stream').Readable;
const testObservable = require('./test-observable');

module.exports = class TestStream extends Readable {
  constructor(test262Dir, options) {
    options = Object.assign({}, options);
    options.objectMode = true;
    super(options);
    this._test262Dir = test262Dir;
    this._options = options;
    this._observable = null;
  }

  _read() {
    if (this._observable) {
      return;
    }
    this._observable = testObservable(this._test262Dir, this._options);

    this._observable.subscribe(
      test => this.push(test),
      error => this.emit('error', error),
      () => this.push(null)
    );
  }
};
