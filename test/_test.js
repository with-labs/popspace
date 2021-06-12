require("dotenv").config()
require("../src/globals.js")
shared.test = shared.requireTesting()
const test = {
  template: require("./template.js"),
}

lib.test = test

module.exports = test
