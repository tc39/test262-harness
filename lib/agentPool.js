'use strict';
const Rx = require('rx');
const eshost = require('eshost');

module.exports = function makePool(agentCount, hostType, hostArguments, hostPath, options = {}) {
  const pool = new Rx.Subject();
  const agents = [];

  for (let i = 0; i < agentCount; i++) {
    eshost.createAgent(hostType, {
      hostArguments,
      hostPath,
      shortName: '$262',
      transform: options.transpiler,
    })
    .then(agent => {
      agents.push(agent);
      pool.onNext(agent);
    })
    .catch(error => displayErrorAndExit(error));
  }

  pool.runTest = record => {
    const agent = record[0];
    const test = record[1];
    const flags = test.attrs.flags || {};
    const evalOptions = {
      async: flags.async || false,
      module: flags.module || false,
    };

    const result = agent.evalScript(test, evalOptions);
    let stopPromise;
    const timeout = setTimeout(() => {
      stopPromise = agent.stop();
    }, options.timeout);

    return result.then(result => {
      clearTimeout(timeout);
      pool.onNext(agent);
      test.rawResult = result;

      if (stopPromise) {
        test.rawResult.timeout = true;
        // wait for the host to stop, then return the test
        return stopPromise.then(() => test);
      }

      const doneError = result.stdout.match(/^Test262:AsyncTestFailure (.*)$/gm);
      if (doneError) {
        const lastErrorString = doneError[doneError.length - 1];
        const [
          /* ignored */,
          name,
          message
        ] = lastErrorString.match(/Test262:AsyncTestFailure ([^:]+): (.*)/);

        test.rawResult.error = {
          name,
          message,
        };
      }
      return test;
    })
    .catch(error => displayErrorAndExit(error));
  };

  pool.destroy = () => {
    agents.forEach(agent => agent.destroy());
  };

  return pool;
};

function displayErrorAndExit(error) {
  console.error('Error running test: ');
  console.error(error);
  process.exit(1);
}
