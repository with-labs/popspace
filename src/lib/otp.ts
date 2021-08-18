// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cryptoRand... Remove this comment to see the full error message
const cryptoRandomString = require('crypto-random-string');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment');

const STANDARD_REQUEST_DURATION_MILLIS = 60 * 60 * 1000;
const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

/**
Some mail services visit email links to check for viruses.
This resolves the magic link before the user actually clicks on it.
To prevent this, we retain link validity for some time after they are
initially resolved.
*/
const RESOLVED_AT_DOUBLE_RESOLVE_BUFFER_MILLIS = 15 * 60 * 1000;

const isPastResolvedOtpBuffer = (resolvedAt) => {
  return (
    moment.utc().valueOf() - moment(resolvedAt).valueOf() >
    RESOLVED_AT_DOUBLE_RESOLVE_BUFFER_MILLIS
  );
};

const otplib = {
  isExpired: (entity) => {
    if (!entity.expiresAt) return false;
    return moment(entity.expiresAt).valueOf() < moment.utc().valueOf();
  },

  // prioritizes IS_VALID -> IS_RESOLVED -> IS_EXPIRED
  verify: (entry, code) => {
    if (!entry || entry.code != code) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.INVALID_CODE };
    }
    return otplib.checkEntryValidity(entry);
  },

  checkEntryValidity: (entry) => {
    if (entry.revokedAt) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.REVOKED_CODE };
    }
    // Note: one other thing we can do that may be equivalent is to
    // just rely on the expiry, and allow resolved unexpired links to be reused.
    // Though perhaps for long-running OTPs that don't expire for a while
    // that would be a bit less secure.
    if (entry.revokedAt && isPastResolvedOtpBuffer(entry.resolved_at)) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.RESOLVED_CODE };
    }
    if (otplib.isExpired(entry)) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.EXPIRED_CODE };
    }
    return { error: null, result: null };
  },

  verifyUnresolvable: (entry, code) => {
    if (!entry || entry.code != code) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.INVALID_CODE };
    }
    return otplib.checkEntryValidityUnresolvable(entry);
  },

  checkEntryValidityUnresolvable: (entry) => {
    if (entry.revokedAt) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.REVOKED_CODE };
    }
    if (otplib.isExpired(entry)) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.EXPIRED_CODE };
    }
    return { error: null, result: null };
  },

  generate: () => {
    const chunks = [];
    for (let i = 0; i < 8; i++) {
      chunks.push(cryptoRandomString({ length: 5, type: 'alphanumeric' }));
    }
    return chunks.join('-');
  },

  standardExpiration: () => {
    return moment(moment.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS)
      .utc()
      .format();
  },

  expirationInNDays: (n) => {
    return moment(moment.utc().valueOf() + ONE_DAY_MILLIS * n)
      .utc()
      .format();
  },

  isValidForEmail(code, email, entry) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const verification = shared.lib.otp.verify(entry, code);
    if (verification.error != null) {
      return verification;
    }
    if (
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      shared.lib.args.consolidateEmailString(entry.email) !=
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      shared.lib.args.consolidateEmailString(email)
    ) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      return { error: shared.error.code.INVALID_CODE };
    }
    return { isValid: true, error: null };
  },
};

module.exports = otplib;
