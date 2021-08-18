import { MagicCode } from '@prisma/client';
declare const _default: {
    dashboard: () => string;
    getVerifyUrl(magic: MagicCode): string;
    getLoginUrl(magic: MagicCode): string;
};
export default _default;
