// Copyright (C) 2014, Microsoft Corporation. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

var fs = require('fs');
var parseFile = require('test262-parser').parseFile;
var helperDir = __dirname + '/helpers/'; 

if (fs.existsSync('test/harness')) {
    helperDir = 'test/harness/';
}

fs.readdirSync(helperDir)
    .forEach(function(file) {
        exports[file] =
            parseFile({contents: fs.readFileSync(helperDir + file, 'utf-8'), file: file});
    });
