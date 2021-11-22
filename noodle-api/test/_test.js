require("dotenv").config()
require("../src/globals.js")
shared.test = require('@withso/noodle-shared/test');
const test = {
  template: require("./template.js"),
}

lib.test = test

module.exports = test
