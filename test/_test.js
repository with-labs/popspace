require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const test = {
  template: require("./template.js"),
  util: require("./util"),
  TestEnvironment: require("./test_environment"),
}

lib.test = test

module.exports = test

