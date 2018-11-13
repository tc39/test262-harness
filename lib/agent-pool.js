'use strict';
const {Subject} = require('rxjs');
const eshost = require('eshost');

const internal = new WeakMap();

class AgentPool extends Subject {
  constructor(agentCount, hostType, hostArguments, hostPath, options = { timeout: 10000 }) {
    super();

    this.options = options;
    this.agents = [];

    for (let i = 0; i < agentCount; i++) {
      eshost.createAgent(hostType, {
        hostArguments,
        hostPath,
        shortName: '$262',
        transform: options.transform,
        out: options.tempDir,
      })
      .then(agent => {
        this.agents.push(agent);
        this.next(agent);
      })
      .catch(error => displayErrorAndExit(error));
    }

    // this.runTest = record => {
    //   const agent = record[0];
    //   const test = record[1];
    //   const flags = test.attrs.flags || {};
    //   const evalOptions = {
    //     async: flags.async || false,
    //     module: flags.module || false,
    //   };
    //   const result = agent.evalScript(test, evalOptions);
    //   let stopPromise;
    //   const timeout = setTimeout(() => {
    //     stopPromise = agent.stop();
    //   }, options.timeout);

    //   return result.then(result => {
    //     clearTimeout(timeout);
    //     pool.next(agent);

    //     test.rawResult = result;
    //     test.compiled = agent.compile(test.contents);

    //     if (stopPromise) {
    //       test.rawResult.timeout = true;
    //       // wait for the host to stop, then return the test
    //       return stopPromise.then(() => test);
    //     }

    //     const doneError = result.stdout.match(/^Test262:AsyncTestFailure:(.*)$/gm);

    //     if (doneError) {
    //       const lastErrorString = doneError[doneError.length - 1];
    //       const [
    //         /* ignored */,
    //         name,
    //         message
    //       ] = lastErrorString.match(/Test262:AsyncTestFailure:([^:]+): (.*)/);

    //       test.rawResult.error = {
    //         name,
    //         message,
    //       };
    //     }
    //     return test;
    //   })
    //   .catch(error => displayErrorAndExit(error));
    // };

    // this.destroy = () => {
    //   agents.forEach(agent => agent.destroy());
    // };
  }

  destroy() {
    // console.log("agents", this.agents);
    // console.log("options", this.options);
    this.agents.forEach(agent => agent.destroy());
  }

  async runTest(record) {
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
    }, this.options.timeout);

    return result.then(result => {
      clearTimeout(timeout);
      this.next(agent);

      test.rawResult = result;
      test.compiled = agent.compile(test.contents);

      if (stopPromise) {
        test.rawResult.timeout = true;
        // wait for the host to stop, then return the test
        return stopPromise.then(() => test);
      }

      const doneError = result.stdout.match(/^Test262:AsyncTestFailure:(.*)$/gm);

      if (doneError) {
        const lastErrorString = doneError[doneError.length - 1];
        const [
          /* ignored */,
          name,
          message
        ] = lastErrorString.match(/Test262:AsyncTestFailure:([^:]+): (.*)/);

        test.rawResult.error = {
          name,
          message,
        };
      }
      return test;
    })
    .catch(error => displayErrorAndExit(error));
  }
}


// function makePool(agentCount, hostType, hostArguments, hostPath, options = {}) {
//   const pool = new Rx.Subject();
//   const agents = [];

//   for (let i = 0; i < agentCount; i++) {
//     eshost.createAgent(hostType, {
//       hostArguments,
//       hostPath,
//       shortName: '$262',
//       transform: options.transform,
//       out: options.tempDir,
//     })
//     .then(agent => {
//       agents.push(agent);
//       pool.next(agent);
//     })
//     .catch(error => displayErrorAndExit(error));
//   }

//   pool.runTest = record => {
//     const agent = record[0];
//     const test = record[1];
//     const flags = test.attrs.flags || {};
//     const evalOptions = {
//       async: flags.async || false,
//       module: flags.module || false,
//     };
//     const result = agent.evalScript(test, evalOptions);
//     let stopPromise;
//     const timeout = setTimeout(() => {
//       stopPromise = agent.stop();
//     }, options.timeout);

//     return result.then(result => {
//       clearTimeout(timeout);
//       pool.next(agent);

//       test.rawResult = result;
//       test.compiled = agent.compile(test.contents);

//       if (stopPromise) {
//         test.rawResult.timeout = true;
//         // wait for the host to stop, then return the test
//         return stopPromise.then(() => test);
//       }

//       const doneError = result.stdout.match(/^Test262:AsyncTestFailure:(.*)$/gm);

//       if (doneError) {
//         const lastErrorString = doneError[doneError.length - 1];
//         const [
//           /* ignored */,
//           name,
//           message
//         ] = lastErrorString.match(/Test262:AsyncTestFailure:([^:]+): (.*)/);

//         test.rawResult.error = {
//           name,
//           message,
//         };
//       }
//       return test;
//     })
//     .catch(error => displayErrorAndExit(error));
//   };

//   pool.destroy = () => {
//     agents.forEach(agent => agent.destroy());
//   };

//   return pool;
// };

function displayErrorAndExit(error) {
  console.error('Error running test: ');
  console.error(error);
  process.exit(1);
}

module.exports = AgentPool;
