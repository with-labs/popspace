require("dotenv").config()
require("jest")
process.env.NODE_ENV = 'test'

const tlib = {
  util: require("./util"),
  factories: require("./factories/_factories"),
  lib: require("../../src/lib/_lib"),
  describeWithLib: (name, handler) => {
    describe(name, () => {
      beforeAll(async () => {
        await lib.init()
        await shared.db.pg.silenceLogs()
      })
      afterAll(async () => {
        return lib.cleanup()
      })
      return handler()
    })
  },
  testServerClients: (nClients, lambda) => {
    return async () => {
      const { clients, mercury } = await tlib.util.serverWithClients(nClients)
      const result = await lambda(clients, mercury)
      await mercury.stop()
      return result
    }
  }
}

global.lib = lib
global.chance = require("chance")()


module.exports = tlib
