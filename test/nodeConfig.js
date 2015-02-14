var t262 = require('../');
t262.useConfig({
    batchConfig: {
        createEnv: 'require("vm").createContext()',
        runBatched: 'env.process = process;env.console=console;require("vm").runInContext(test, env, {displayErrors: false});'
    }
})
