const lib = {}

lib.ws = require('ws')

lib.log = require("./log")
global.log = lib.log
global.shared = require("@withso/with-shared")
lib.Client = require("../client/client")
lib.ErrorCodes = require("./error_codes")
lib.dto = require("./dto/_dto")
lib.event = require("./event/_events")

const RoomData = require("./room_data")

lib.init = async () => {
  lib.roomData = new RoomData()
  await lib.roomData.init()
  await global.shared.db.pg.init()
}
lib.cleanup = async() => {
  await global.shared.db.pg.tearDown()
}

lib.error = async (code, message, data={}) => {
  return Object.assign({
    success: false,
    code: code,
    message: message,
    data: data
  })
}

global.lib = lib

module.exports = lib
