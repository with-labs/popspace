global.lib = require("./lib/_lib")
global.api = require("./api/_api")
global.shared = lib.shared
global.log = lib.log

module.exports = {
  lib, api, shared, log
}
