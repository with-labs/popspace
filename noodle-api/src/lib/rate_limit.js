/*
  In-memory limiter for failed password attempts. Good enough for a
  single self-hosted API process; counters reset on restart.
*/
const WINDOW_MILLIS = 15 * 60 * 1000
const MAX_FAILURES = 10

const failures = new Map()

const keyFor = (scope, req) => `${scope}:${req.realIp}`

const rateLimit = {
  isBlocked: (scope, req) => {
    const entry = failures.get(keyFor(scope, req))
    if (!entry) {
      return false
    }
    if (Date.now() - entry.firstAt > WINDOW_MILLIS) {
      failures.delete(keyFor(scope, req))
      return false
    }
    return entry.count >= MAX_FAILURES
  },

  recordFailure: (scope, req) => {
    const key = keyFor(scope, req)
    const entry = failures.get(key)
    if (!entry || Date.now() - entry.firstAt > WINDOW_MILLIS) {
      failures.set(key, { count: 1, firstAt: Date.now() })
    } else {
      entry.count++
    }
  },

  reset: (scope, req) => {
    failures.delete(keyFor(scope, req))
  }
}

module.exports = rateLimit
