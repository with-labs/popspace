const testLib = {
  factories: require("./factories/_factories"),
  TestTemplate: require("./test_template"),
  TestEnvironment: require("./test_environment"),
  models: require("./models/_models"),
  init: async () => {
		if(process.env.NODE_ENV != 'test') {
		  throw "NODE_ENV must be test"
		}
		testLib.factories()
  }
}

testLib.chance = require("chance")()

module.exports = testLib
