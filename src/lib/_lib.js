const lib = {}

lib.ws = require('ws')

lib.log = require("./log")
global.log = lib.log
global.shared = require("@withso/with-shared")
lib.Client = require("../client/client")
lib.ErrorCodes = require("./error_codes")
lib.event = require("./event/_events")
lib.util = require("./util")
lib.appInfo = require("./app_info")

const RoomData = require("./room_data")
const Analytics = require("./analytics")

lib.init = async () => {
  lib.roomData = new RoomData()
  lib.analytics = new Analytics()
  await lib.roomData.init()
  await shared.db.pg.init()
  await shared.db.dynamo.init()
}
lib.cleanup = async() => {
  await shared.db.pg.tearDown()
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
