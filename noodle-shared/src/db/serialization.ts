/**
 * JSON doesn't support serializing bigints.
 * These tools help do that at the network layer so we can
 * send bigints as simple strings.
 */
const serialization = {
  replacer: (key: string, value: any) => {
    return value;
  },

  serialize: (value: any) => {
    return JSON.stringify(value);
  },

  reviver: (key: string, value: any) => {
    return value;
  },

  deserialize: (value: string) => {
    return JSON.parse(value);
  },

  // private
  formatBigInt: (value: bigint | BigInt) => {
    return value.toString();
  },

  detectBigInt: (value: any) => {
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

  parseBigInt: (value: string | number) => {
    return BigInt(value);
  },
};

export default serialization;

// also setup bigint default serialization...
(BigInt.prototype as any).toJSON = function () {
  return serialization.formatBigInt(this);
};
