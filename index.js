const shared = {
  db: require("./src/db/_index"),
  lib: require("./src/lib/_index"),
  error: require("./src/error/_error"),
  models: require("./src/models/_models"),
  api: require("./src/api/_api"),
  init: async () => {
    await shared.db.pg.init()
  },
  cleanup: async () => {
    await shared.db.pg.tearDown()
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
