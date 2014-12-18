var t262 = require('../');
t262.useConfig({
    batchConfig: {
        createEnv: 'require("vm").createContext()',
        runBatched: 'env.process = process;require("vm").runInContext(test, env);'
    }
})
