const lib = {}

lib.ws = require('ws')

lib.log = require("./log")
global.log = lib.log
lib.Client = require("../client/client.js")


lib.init = async () => {

}

global.lib = lib


module.exports = lib
