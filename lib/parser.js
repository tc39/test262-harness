// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var fs = require('fs');
var through = require('through');
var yaml = require('js-yaml');

function parseFile(file) {
    var start = file.contents.indexOf('/*---');

    if(start > -1) {
        var end = file.contents.indexOf('---*/');
        try {
            file.attrs = yaml.load(file.contents.substring(start + 2, end)) || {};
        } catch (e) {
            console.log(e.message);
            console.log("Exception reading file " + file.file);
        }
    }

    file.attrs = file.attrs || {};
    file.attrs.flags = file.attrs.flags || [];
    file.attrs.flags = file.attrs.flags.reduce(function(acc, v) {
        acc[v] = true;
        return acc;
    }, {});
    file.attrs.includes = file.attrs.includes || [];

    return file;
}

module.exports = through(function(data) { this.queue(parseFile(data)) })
module.exports.parseFile = parseFile;

