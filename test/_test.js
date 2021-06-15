require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const test = {
  template: require("./template.js"),
  models: require("./models/_models.js"),
  util: require("./util.js"),
  TestEnvironment: require("./test_environment.js"),
}

lib.test = test

module.exports = test

