// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var tap = require('tap');
var tapProducer = new tap.Producer(true);
var through = require('through');
var duplex = require('duplexer');

var tapify = through(function(test) {
    if(test.pass) {
        test.ok = true;
    } else {
        test.ok = false;
    }

    if(test.error && test.error.message) {
        test.error = test.error.message;
    }

    test.name = test.attrs.description

    Object.keys(test).filter(function(k) {
        return k !== "ok" && k !== "name" && k !== "id" && k !== 'error'
            && k !== "file";
    }).forEach(function(k) {
        delete test[k];
    });

    this.queue(test);
 });

 tapify.pipe(tapProducer);
 module.exports = duplex(tapify, tapProducer);

