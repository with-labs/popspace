/**
 * JSON doesn't support serializing bigints.
 * These tools help do that at the network layer so we can
 * send bigints as simple strings.
 */
const serialization = {
  replacer: (key, value) => {
    if (typeof value === 'bigint' || value instanceof BigInt) {
      return serialization.formatBigInt(value);
    }
    return value;
  },

  serialize: (value) => {
    return JSON.stringify(value, serialization.replacer);
  },

  reviver: (key, value) => {
    if (serialization.detectBigInt(value)) {
      return serialization.parseBigInt(value);
    }
    return value;
  },

  deserialize: (value) => {
    return JSON.parse(value, serialization.reviver);
  },

  // private
  formatBigInt: (value) => {
    return value.toString();
  },

  detectBigInt: (value) => {
    if (typeof value !== 'string') {
      return false;
    }
    if (value === '') return false;
    try {
      const bigInt = BigInt(value);
      return true;
    } catch (_) {
      return false;
    }
  },

  parseBigInt: (value) => {
    return BigInt(value);
  },
};

module.exports = serialization;

// also setup bigint default serialization...
(BigInt.prototype as any).toJSON = function () {
    return serialization.formatBigInt(this);
};
