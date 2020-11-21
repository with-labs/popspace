require("dotenv").config()
require("jest")
process.env.NODE_ENV = 'test'

const tlib = {
  util: require("./util"),
  factories: require("./factories/_factories"),
  lib: require("../../src/lib/_lib"),
  TestTemplate: require("./test_template"),
  TestEnvironment: require("./test_environment")
}

global.lib = lib
global.chance = require("chance")()


module.exports = tlib
