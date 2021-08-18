const testLib = {
  TestTemplate: require('./test_template.js'),
  TestEnvironment: require('./test_environment.js'),
  TestScenarioRunner: require('./test_scenario_runner.js'),
  clients: require('./clients/_clients.js'),
  init: async () => {
    if (process.env.NODE_ENV != 'test') {
      throw 'NODE_ENV must be test';
    }
    return testLib;
  },
};

testLib.chance = require('chance')();

export defaulttestLib;
