import { MagicCode } from '@prisma/client';
import cryptoRandomString from 'crypto-random-string';
import moment from 'moment';

import _error from '../error/_error';

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
  isExpired: (entity: MagicCode) => {
    if (!entity.expiresAt) return false;
    return moment(entity.expiresAt).valueOf() < moment.utc().valueOf();
  },

  // prioritizes IS_VALID -> IS_RESOLVED -> IS_EXPIRED
  verify: (entry: MagicCode, code: string) => {
    if (!entry || entry.code != code) {
      return { error: _error.code.INVALID_CODE };
    }
    return otplib.checkEntryValidity(entry);
  },

  checkEntryValidity: (entry: MagicCode) => {
    if (entry.revokedAt) {
      return { error: _error.code.REVOKED_CODE };
    }
    // Note: one other thing we can do that may be equivalent is to
    // just rely on the expiry, and allow resolved unexpired links to be reused.
    // Though perhaps for long-running OTPs that don't expire for a while
    // that would be a bit less secure.
    if (entry.revokedAt && isPastResolvedOtpBuffer(entry.resolvedAt)) {
      return { error: _error.code.RESOLVED_CODE };
    }
    if (otplib.isExpired(entry)) {
      return { error: _error.code.EXPIRED_CODE };
    }
    return { error: null, result: null };
  },

  verifyUnresolvable: (entry: MagicCode, code: string) => {
    if (!entry || entry.code != code) {
      return { error: _error.code.INVALID_CODE };
    }
    return otplib.checkEntryValidityUnresolvable(entry);
  },

  checkEntryValidityUnresolvable: (entry: MagicCode) => {
    if (entry.revokedAt) {
      return { error: _error.code.REVOKED_CODE };
    }
    if (otplib.isExpired(entry)) {
      return { error: _error.code.EXPIRED_CODE };
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

  expirationInNDays: (n: number) => {
    return moment(moment.utc().valueOf() + ONE_DAY_MILLIS * n)
      .utc()
      .format();
  },

  // unused, email doesn't exist on MagicCode anymore

  // isValidForEmail: (code: string, email: string, entry: MagicCode) => {
  //   const verification = otplib.verify(entry, code);
  //   if (verification.error != null) {
  //     return verification;
  //   }
  //   if (
  //     args.consolidateEmailString(entry.email) !=
  //     args.consolidateEmailString(email)
  //   ) {
  //     return { error: _error.code.INVALID_CODE };
  //   }
  //   return { isValid: true, error: null };
  // },
};

export default otplib;
