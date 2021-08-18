/*
  Class for managing sessions with postgres.

  If we have replica-choosing logic, this is the logical place to put it.
*/
const massive = require('massive');
const monitor = require('pg-monitor');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require("moment")
const AsyncLock = require('async-lock')
const lock = new AsyncLock();

/*
  Massive relies on setImmediate wtf.
  https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
  It's not standard js; when I run tests in noodle-api,
  it works, but in hermes I get an error that setImmediate isn't defined.

  They do have it in Node... so I don't understand why it
  works in one repo and not another.
  https://nodejs.dev/learn/understanding-setimmediate

  We can always pull in a proper polyfill
  https://www.npmjs.com/package/setimmediate

  But seems like there should be a better solution if it works
  in noodle-api - and used to work previously in mercury and others.
*/
// @ts-expect-error ts-migrate(2322) FIXME: Type '(((callback: (...args: any[]) => void, ...ar... Remove this comment to see the full error message
global.setImmediate = global.setImmediate || ((x) => {
  // https://stackoverflow.com/questions/15349733/setimmediate-vs-nexttick/15349865#15349865
  return process.nextTick(x)
})

if(!(global as any).log) {
  // Perhaps the shared repo can have a standard log defined at the top level
(global as any).log = {
    app: {
        debug: (message) => (console.log(message)),
        info: (message) => (console.log(message)),
        warn: (message) => (console.log(message)),
        error: (message) => (console.log(message))
    }
};
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
  massive: any;
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
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
        log.app.warn("monitor.attach failed, rertying", e)
        try {
          monitor.detach()
          monitor.attach(__db.driverConfig)
          monitor.setTheme('matrix')
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
          log.app.warn("Having to detach and re-attach monitor")
        } catch (weirdException) {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
          log.app.warn("Failed to attach monitor", weirdException)
        }
      }
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
      log.app.debug("Initialized postgres")
      return __db
    })
    return __db
  }

  async tearDown() {
    await lock.acquire('with_teardown_pg', async () => {
      if(__db) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
        log.app.info("Acquired tear down lock")
        try {
          monitor.detach()
        } catch(e) {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
          log.app.warn("Detaching unattached monitor")
          // Nothing to do...
        }
        try {
          await __db.instance.$pool.end()
        } catch(e) {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
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
