require("dotenv").config()


require("jest")

const tlib = {
  util: require("./util"),
  factories: require("./factories/_factories"),
  lib: require("../../src/lib/_lib"),
  TestTemplate: require("./test_template"),
  TestEnvironment: require("./test_environment"),
  models: require("./models/_models"),
  init: async () => {
		if(process.env.NODE_ENV != 'test') {
		  throw "NODE_ENV must be test"
		}
		tlib.factories()
  }
}

require("../../src/globals")
global.chance = require("chance")()


module.exports = tlib
