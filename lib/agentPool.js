'use strict';
const Rx = require('rx');
const eshost = require('eshost');
const Path = require('path');

module.exports = function makePool(agentCount, hostType, hostArguments, hostPath, options = {}) {
  const pool = new Rx.Subject();
  const agents = [];

  for (let i = 0; i < agentCount; i++) {
    eshost.createAgent(hostType, {
      hostArguments,
      hostPath,
      shortName: '$262'
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
    const rootPath = Path.dirname(test.file);

    let result;
    if (test.attrs.flags && test.attrs.flags.module) {
      let currentCWD = process.cwd();
      process.chdir(rootPath);
      let modStr = `
        var cmpn = $262.evalModule('import "${test.file}"');
        if (cmpn.type === 'throw') {
          throw cmpn.value;
        }
      `;
      if (test.contents.indexOf("$DONE") === -1) {
        modStr += '$DONE();'
      }
      result = agent.evalScript(test.deps + modStr, { async: true });
      //process.chdir(currentCWD);
    } else {
      let scriptStr = test.deps + test.contents;
      if (scriptStr.indexOf('$DONE') === -1) {
        scriptStr += ';$DONE();'
      }
      result = agent.evalScript(scriptStr, { async: true });
      
    }
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

      const doneError = result.stdout.match(/^test262\/error (.*)$/gm);
      if (doneError) {
        const lastErrorString = doneError[doneError.length - 1];
        const [
          /* ignored */,
          name,
          message
        ] = lastErrorString.match(/test262\/error ([^:]+): (.*)/);

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
