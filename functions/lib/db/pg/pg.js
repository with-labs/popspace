/*
Class for managing sessions with postgres.

Currently based on massive.js which manages a connection pool.

In netlify, we need to manually tear down the connections at the
end of a function's execution.
*/
const massive = require('massive');
const monitor = require('pg-monitor');
const moment = require("moment")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();


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
      } catch(e) {
        // With lambdas it seems sometimes the monitor fails to detach between runs
        // keep logs to understand frequency
        console.log("======= monitor.attach failed, rertying", e)
        try {
          monitor.detach()
          monitor.attach(__db.driverConfig)
          console.log("========== Having to detach and re-attach monitor")
        } catch (weirdException) {
          console.log("========== Failed to attach monitor", weirdException)
        }
      }
      console.log("Donezo")
      return __db
    })
    return __db
  }

  async tearDown() {
    var lock = new AsyncLock();
    return new Promise((resolve, reject) => {
      lock.acquire('with_teardown_pg', async (cb) => {
        if(__db) {
          try {
            monitor.detach()
          } catch(e) {
            console.log("====== Warning: detaching unattached monitor")
            // Nothing to do...
          }
          // await db.pgp.end()
          try {
            await __db.instance.$pool.end()
          } catch(e) {
            console.log("===== Warning: end pool multiple times")
          }
          __db = null
          this.massive = null
        }
      })
    })
  }

  async silenceLogs() {
    monitor.detach()
  }
}


module.exports = new Pg()
