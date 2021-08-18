/**
 * JSON doesn't support serializing bigints.
 * These tools help do that at the network layer so we can
 * send bigints as simple strings.
 */
declare const serialization: {
    replacer: (key: string, value: any) => any;
    serialize: (value: any) => string;
    reviver: (key: string, value: any) => any;
    deserialize: (value: string) => any;
    formatBigInt: (value: bigint | BigInt) => string;
    detectBigInt: (value: any) => boolean;
    parseBigInt: (value: string | number) => bigint;
};
export default serialization;
