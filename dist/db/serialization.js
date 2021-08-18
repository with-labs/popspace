"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * JSON doesn't support serializing bigints.
 * These tools help do that at the network layer so we can
 * send bigints as simple strings.
 */
var serialization = {
    replacer: function (key, value) {
        if (typeof value === 'bigint' || value instanceof BigInt) {
            return serialization.formatBigInt(value);
        }
        return value;
    },
    serialize: function (value) {
        return JSON.stringify(value, serialization.replacer);
    },
    reviver: function (key, value) {
        if (serialization.detectBigInt(value)) {
            return serialization.parseBigInt(value);
        }
        return value;
    },
    deserialize: function (value) {
        return JSON.parse(value, serialization.reviver);
    },
    // private
    formatBigInt: function (value) {
        return value.toString();
    },
    detectBigInt: function (value) {
        if (typeof value !== 'string') {
            return false;
        }
        if (value === '')
            return false;
        try {
            var bigInt = BigInt(value);
            return true;
        }
        catch (_) {
            return false;
        }
    },
    parseBigInt: function (value) {
        return BigInt(value);
    },
};
exports.default = serialization;
// also setup bigint default serialization...
BigInt.prototype.toJSON = function () {
    return serialization.formatBigInt(this);
};
