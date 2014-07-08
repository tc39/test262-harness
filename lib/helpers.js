// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var fs = require('fs');
var parseFile = require('./parser').parseFile;

fs.readdirSync(__dirname + '/helpers')
    .forEach(function(file) {
        exports[file] =
            parseFile({contents: fs.readFileSync(__dirname + '/helpers/' + file, 'utf-8'), file: file});
    });
