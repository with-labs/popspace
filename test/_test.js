const FactoryGirl = require("factory-girl");

const testLib = {
  factory: FactoryGirl.factory,
  factories: require("./factories/_factories.js"),
  TestTemplate: require("./test_template.js"),
  TestEnvironment: require("./test_environment.js"),
  TestScenarioRunner: require("./test_scenario_runner.js"),
  models: require("./models/_models.js"),
  clients: require("./clients/_clients.js"),
  init: async () => {
		if(process.env.NODE_ENV != 'test') {
		  throw "NODE_ENV must be test"
		}
		testLib.factories()
    return testLib
  }
}

testLib.chance = require("chance")()

module.exports = testLib
