const lib = {}

lib.ws = require('ws')

lib.log = require("./log")
global.log = lib.log
global.shared = require("@withso/with-shared")
lib.Client = require("../client/client.js")

lib.init = async () => {
  // await shared.pg.init()
}

global.lib = lib


module.exports = lib
