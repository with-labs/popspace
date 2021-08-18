"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_random_string_1 = __importDefault(require("crypto-random-string"));
var moment_1 = __importDefault(require("moment"));
var _error_1 = __importDefault(require("../error/_error"));
var STANDARD_REQUEST_DURATION_MILLIS = 60 * 60 * 1000;
var ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
/**
Some mail services visit email links to check for viruses.
This resolves the magic link before the user actually clicks on it.
To prevent this, we retain link validity for some time after they are
initially resolved.
*/
var RESOLVED_AT_DOUBLE_RESOLVE_BUFFER_MILLIS = 15 * 60 * 1000;
var isPastResolvedOtpBuffer = function (resolvedAt) {
    return (moment_1.default.utc().valueOf() - moment_1.default(resolvedAt).valueOf() >
        RESOLVED_AT_DOUBLE_RESOLVE_BUFFER_MILLIS);
};
var otplib = {
    isExpired: function (entity) {
        if (!entity.expiresAt)
            return false;
        return moment_1.default(entity.expiresAt).valueOf() < moment_1.default.utc().valueOf();
    },
    // prioritizes IS_VALID -> IS_RESOLVED -> IS_EXPIRED
    verify: function (entry, code) {
        if (!entry || entry.code != code) {
            return { error: _error_1.default.code.INVALID_CODE };
        }
        return otplib.checkEntryValidity(entry);
    },
    checkEntryValidity: function (entry) {
        if (entry.revokedAt) {
            return { error: _error_1.default.code.REVOKED_CODE };
        }
        // Note: one other thing we can do that may be equivalent is to
        // just rely on the expiry, and allow resolved unexpired links to be reused.
        // Though perhaps for long-running OTPs that don't expire for a while
        // that would be a bit less secure.
        if (entry.revokedAt && isPastResolvedOtpBuffer(entry.resolvedAt)) {
            return { error: _error_1.default.code.RESOLVED_CODE };
        }
        if (otplib.isExpired(entry)) {
            return { error: _error_1.default.code.EXPIRED_CODE };
        }
        return { error: null, result: null };
    },
    verifyUnresolvable: function (entry, code) {
        if (!entry || entry.code != code) {
            return { error: _error_1.default.code.INVALID_CODE };
        }
        return otplib.checkEntryValidityUnresolvable(entry);
    },
    checkEntryValidityUnresolvable: function (entry) {
        if (entry.revokedAt) {
            return { error: _error_1.default.code.REVOKED_CODE };
        }
        if (otplib.isExpired(entry)) {
            return { error: _error_1.default.code.EXPIRED_CODE };
        }
        return { error: null, result: null };
    },
    generate: function () {
        var chunks = [];
        for (var i = 0; i < 8; i++) {
            chunks.push(crypto_random_string_1.default({ length: 5, type: 'alphanumeric' }));
        }
        return chunks.join('-');
    },
    standardExpiration: function () {
        return moment_1.default(moment_1.default.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS)
            .utc()
            .format();
    },
    expirationInNDays: function (n) {
        return moment_1.default(moment_1.default.utc().valueOf() + ONE_DAY_MILLIS * n)
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
exports.default = otplib;
