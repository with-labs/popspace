import { MagicCode } from '@prisma/client';

export default {
  dashboard: () => {
    return '/';
  },
  getVerifyUrl(magic: MagicCode) {
    return `/verify_account?code=${encodeURIComponent(magic.code)}`;
  },
  getLoginUrl(magic: MagicCode) {
    return `/login?code=${encodeURIComponent(magic.code)}`;
  },
};
