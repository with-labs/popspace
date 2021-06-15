const Analytics = require("./analytics")

const lib = {
  ws: require("ws"),
  log: require("./log"),
  shared: require("@withso/noodle-shared"),
  Client: require("../client/client"),
  ErrorCodes: require("./error_codes"),
  event: require("./event/_events"),
  util: require("./util"),
  appInfo: require("./app_info"),
  SocketGroup: require("./socket_group"),
  analytics: new Analytics(),
  init: async () => {
    await shared.db.pg.init()
    if(process.env.NODE_ENV == "test") {
      lib.test = require("../../test/_test.js")
    }
  },
  cleanup: async () => {
    await shared.db.pg.tearDown()
  },
  error: async (code, message, data = {}) => {
    return Object.assign({
      success: false,
      code: code,
      message: message,
      data: data,
    })
  },
}


module.exports = lib
