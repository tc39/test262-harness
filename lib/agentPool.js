'use strict';
const Rx = require('rx');
const eshost = require('eshost');

module.exports = makePool;
function makePool(agents, hostType, hostArgs, hostPath) {
  const pool = new Rx.Subject();

  for (var i = 0; i < agents; i++) {
    eshost.createAgent(hostType, {
      hostArguments: hostArgs,
      hostPath: hostPath
    })
    .then(agent => {
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
    return agent.evalScript(test.contents, { async: true })
    .then(result => {
      pool.onNext(agent);
      test.rawResult = result;
      return test;
    })
    .catch(err => {
      console.error('Error running test: ', err);
      process.exit(1);
    });
  }
  return pool;
}
