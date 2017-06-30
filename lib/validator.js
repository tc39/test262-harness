module.exports = function validate(test) {
  const result = test.rawResult;
  const isNegative = test.attrs.flags.negative || test.attrs.negative;
  const ranToFinish = result.stdout.indexOf('test262/done') > -1;
  const desc = (test.attrs.description || '').trim();
  
  if (result.timeout) {
    return {
      pass: false,
      message: 'Test timed out'
    }
  }
  if (!isNegative) {
    if (result.error !== null) {
      if (result.error.name === 'Test262Error') {
        return {
          pass: false,
          message: result.error.message
        };
      } else {
        return {
          pass: false,
          message: `Expected no error, got ${result.error.name}: ${result.error.message}`
        };
      }
    } else if (!ranToFinish && !test.attrs.flags.raw) {
      return {
        pass: false,
        message: `Test did not run to completion`
      };
    } else {
      return { pass: true };
    }
  } else {
    if (test.attrs.flags.negative) {
      if (result.error) {
        return { pass: true };
      } else {
        return {
          pass: false,
          message: `Expected test to throw some error`
        };
      }
    } else {
      if (!result.error) {
        return {
          pass: false,
          message: `Expected test to throw error of type ${test.attrs.negative.type}, but did not throw error`
        };
      } else if (result.error.name == test.attrs.negative.type) {
        return { pass: true };
      } else {
        return {
          pass: false,
          message: `Expected test to throw error of type ${test.attrs.negative.type}, got ${result.error.name}: ${result.error.message}`
        };
      }
    }
  }
}
