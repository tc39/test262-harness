'use strict';
const Rx = require('rx');
const eshost = require('eshost');

module.exports = makePool;
function makePool(agentCount, hostType, hostArgs, hostPath, options = {}) {
  const pool = new Rx.Subject();
  const agents = [];

  for (var i = 0; i < agentCount; i++) {
    eshost.createAgent(hostType, {
      hostArguments: hostArgs,
      hostPath: hostPath,
      shortName: '$262'
    })
    .then(agent => {
      agents.push(agent);
      pool.onNext(agent);
    })
    .catch(e => {
      console.error('Error creating agent: ');
      console.error(e);
      process.exit(1);
    });
  }

  pool.runTest = function (record) {
    const agent = record[0];
    const test = record[1];
    const result = agent.evalScript(test.contents, { async: true });
    let stopPromise;
    const timeout = setTimeout(() => {
      stopPromise = agent.stop();
    }, options.timeout);

    return result
      .then(result => {
        clearTimeout(timeout);
        pool.onNext(agent);
        test.rawResult = result;

        if (stopPromise) {
          test.rawResult.timeout = true;
          // wait for the host to stop, then return the test
          return stopPromise.then(() => test);
        }

        const doneError = result.stdout.match(/^test262\/error (.*)$/gm); 
        if (doneError) {
          const lastErrorString = doneError[doneError.length - 1];
          const errorMatch = lastErrorString.match(/test262\/error ([^:]+): (.*)/);
          test.rawResult.error = {
            name: errorMatch[1],
            message: errorMatch[2]
          }
        } 
        return test;
      })
      .catch(err => {
        console.error('Error running test: ', err);
        process.exit(1);
      });
  }

  pool.destroy = function () {
    agents.forEach(agent => agent.destroy());
  }

  return pool
}
