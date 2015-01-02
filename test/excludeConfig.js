var t262 = require('../');
t262.useConfig({
	// test exclusion of multiple globs
	// exclude tests start with a or b
    exclude: ["test/collateral/a*.js", "test/collateral/b*.js"]
})