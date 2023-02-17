const Analytics = require("./analytics")
const shared = require('@withso/noodle-shared')

const lib = {
  ws: require("ws"),
  log: require("./log"),
  shared: shared.default,
  Client: require("../client/client"),
  ErrorCodes: require("./error_codes"),
  event: require("./event/_events"),
  util: require("./util"),
  appInfo: require("./app_info"),
  SocketGroup: require("./socket_group"),
  analytics: new Analytics(),
  init: async () => {
    if(process.env.NODE_ENV == "test") {
      lib.test = require("../../test/_test.js")
    }
  },
  cleanup: async () => {
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
