require("dotenv").config()
process.env.NODE_ENV = 'test'

const tlib = {
  util: require("./util"),
  factories: require("./factories/_factories"),
  lib: require("../../src/lib/_lib")
}

global.lib = lib
global.chance = require("chance")()


module.exports = tlib
