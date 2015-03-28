// Copyright (C) 2014, Caitlin Potter. All rights reserved.
// This code is governed by the BSD License found in the LICENSE file.

module.exports = D8Runner;

var ConsoleRunner = require('./console');

function D8Runner(args) {
    args.consolePrintCommand = args.consolePrintCommand || "print";

    ConsoleRunner.apply(this, arguments);
}

D8Runner.prototype = Object.create(ConsoleRunner.prototype);
D8Runner.prototype._createEnv = 'Realm.create()';
D8Runner.prototype._runBatched = 'Realm.eval(env, test)';
D8Runner.prototype._setRealmValue = function(env, property, value) {
    Realm.shared = value;
    Realm.eval(env, "var " + property + " = Realm.shared;");
}.toString();
