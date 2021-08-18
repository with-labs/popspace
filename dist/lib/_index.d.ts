declare const _default: {
    auth: import("./auth").Auth;
    args: {
        consolidateEmailString: (email: string) => string;
        multiSpaceToSingleSpace: (str: string) => string;
        multiDashToSingleDash: (str: string) => string;
    };
    otp: {
        isExpired: (entity: import(".prisma/client").MagicCode) => boolean;
        verify: (entry: import(".prisma/client").MagicCode, code: string) => {
            error: any;
            result: any;
        } | {
            error: string;
        };
        checkEntryValidity: (entry: import(".prisma/client").MagicCode) => {
            error: string;
            result?: undefined;
        } | {
            error: any;
            result: any;
        };
        verifyUnresolvable: (entry: import(".prisma/client").MagicCode, code: string) => {
            error: any;
            result: any;
        } | {
            error: string;
        };
        checkEntryValidityUnresolvable: (entry: import(".prisma/client").MagicCode) => {
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
    routes: {
        dashboard: () => string;
        getVerifyUrl(magic: import(".prisma/client").MagicCode): string;
        getLoginUrl(magic: import(".prisma/client").MagicCode): string;
    };
};
export default _default;
