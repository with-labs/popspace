/*
  In-memory limiter for password attempts. Good enough for a
  single self-hosted API process; counters reset on restart.

  Each IP gets MAX_ATTEMPTS tries; using up the last one without
  succeeding bans the IP for BAN_MILLIS. Attempts are counted before
  the password is checked, so parallel requests can't all slip in
  while the first wrong password is still being verified.
*/
const MAX_ATTEMPTS = 3
const BAN_MILLIS = 30 * 60 * 1000

const attempts = new Map()

// req.ip honours the TRUST_PROXY setting, unlike the raw X-Forwarded-For header
const keyFor = (scope, req) => `${scope}:${req.ip}`

const rateLimit = {
  MAX_ATTEMPTS,

  /*
    Records an attempt. Returns { allowed: false, retryAfterMillis } while
    banned, otherwise { allowed: true, attemptsLeft } where attemptsLeft is
    what remains if this attempt turns out to be wrong.
  */
  consume: (scope, req) => {
    const key = keyFor(scope, req)
    const now = Date.now()
    let entry = attempts.get(key)
    if (entry && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        return { allowed: false, retryAfterMillis: entry.blockedUntil - now }
      }
      entry = null
    }
    // forget old failures that never added up to a ban
    if (!entry || now - entry.firstAt > BAN_MILLIS) {
      entry = { count: 0, firstAt: now, blockedUntil: null }
      attempts.set(key, entry)
    }
    entry.count++
    if (entry.count >= MAX_ATTEMPTS) {
      entry.blockedUntil = now + BAN_MILLIS
    }
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - entry.count }
  },

  reset: (scope, req) => {
    attempts.delete(keyFor(scope, req))
  },

  // user-facing message for a wrong password or an active ban
  failureMessage: (prefix, { attemptsLeft, retryAfterMillis }) => {
    if (retryAfterMillis === undefined && attemptsLeft > 0) {
      return `${prefix}. You have ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left.`
    }
    const minutes = Math.ceil((retryAfterMillis === undefined ? BAN_MILLIS : retryAfterMillis) / 60000)
    return `${prefix}. Too many failed attempts, try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`
  }
}

module.exports = rateLimit
