/*
  Class for managing sessions with postgres.

  If we have replica-choosing logic, this is the logical place to put it.
*/
const massive = require('massive');
const monitor = require('pg-monitor');
const moment = require("moment")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

if(!global.log) {
  // Perhaps the shared repo can have a standard log defined at the top level
  global.log = {
    app: {
      debug: (message) => (console.log(message)),
      info: (message) => (console.log(message)),
      warn: (message) => (console.log(message)),
      error: (message) => (console.log(message))
    }
  }
}

const overridePgTimestampConversion = () => {
  // node-postgres, which is what massivejs is based on,
  // performs time zone conversion.
  // this screws everything up if you store dates in UTC
  // what we want is to return the raw date.
  const types = require('pg').types;
  const timestampOID = 1114;
  types.setTypeParser(1114, function(stringValue) {
    return stringValue;
  })
}

let __db = null

class Pg {
  async init() {
    await lock.acquire('with_init_pg', async () => {
      if(__db) {
        this.massive = __db
        return __db
      }
      overridePgTimestampConversion()
      // Require it here to make sure environment is set up with Netlify.
      // We inject env vars manually after the function starts,
      // but after module dependencies are loaded
      // so unless we access process.env after dependencies are loaded,
      // we won't have the credentials.
      const config = require('./config.js')
      __db = await massive(config)
      this.massive = __db
      try {
        monitor.attach(__db.driverConfig);
        monitor.setTheme('matrix')
      } catch(e) {
        // With lambdas it seems sometimes the monitor fails to detach between runs
        // keep logs to understand frequency
        log.app.warn("monitor.attach failed, rertying", e)
        try {
          monitor.detach()
          monitor.attach(__db.driverConfig)
          monitor.setTheme('matrix')
          log.app.warn("Having to detach and re-attach monitor")
        } catch (weirdException) {
          log.app.warn("Failed to attach monitor", weirdException)
        }
      }
      log.app.debug("Initialized postgres")
      return __db
    })
    return __db
  }

  async tearDown() {
    await lock.acquire('with_teardown_pg', async () => {
      log.app.info("Acquired tear down lock")
      if(__db) {
        try {
          monitor.detach()
        } catch(e) {
          log.app.warn("Detaching unattached monitor")
          // Nothing to do...
        }
        try {
          await __db.instance.$pool.end()
        } catch(e) {
          log.app.warn("Ending pool multiple times")
        }
        __db = null
        this.massive = null
      }
      return true
    })
    return
  }

  async silenceLogs() {
    monitor.detach()
  }
}


module.exports = new Pg()
