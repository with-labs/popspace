const shared = {
  db: require("./src/db/_index.js"),
  lib: require("./src/lib/_index.js"),
  error: require("./src/error/_error.js"),
  models: require("./src/models/_models.js"),
  api: require("./src/api/_api.js"),
  net: require("./src/net/_net.js"),
  init: async () => {
    await shared.db.pg.init()
  },
  cleanup: async () => {
    await shared.db.pg.tearDown()
  },
  requireTesting: () => {
    if(process.env.NODE_ENV != 'test') {
      throw "NODE_ENV must be test"
    }
    shared.test = require("./test/_test.js")
    /*
      can be more explicit/verbose:
      shared.test = shared.initTesting()
    */
    return shared.test
  },
  initDynamo: async () => {
    /*
      Avoiding puting this into the general init -
      at least until I set up readonly credentials,
      so auxiliary microservices can safely init
    */
    await shared.db.dynamo.init()
    /*
      No cleanup necessary in general,
      it's just individual API calls that have credentials
    */
  },
}

module.exports = shared
