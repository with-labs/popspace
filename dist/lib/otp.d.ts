import { MagicCode } from '@prisma/client';
declare const otplib: {
    isExpired: (entity: MagicCode) => boolean;
    verify: (entry: MagicCode, code: string) => {
        error: any;
        result: any;
    } | {
        error: string;
    };
    checkEntryValidity: (entry: MagicCode) => {
        error: string;
        result?: undefined;
    } | {
        error: any;
        result: any;
    };
    verifyUnresolvable: (entry: MagicCode, code: string) => {
        error: any;
        result: any;
    } | {
        error: string;
    };
    checkEntryValidityUnresolvable: (entry: MagicCode) => {
        error: string;
        result?: undefined;
    } | {
        error: any;
        result: any;
    };
    generate: () => string;
    standardExpiration: () => string;
    expirationInNDays: (n: number) => string;
};
export default otplib;
