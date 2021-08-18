"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    dashboard: function () {
        return '/';
    },
    getVerifyUrl: function (magic) {
        return "/verify_account?code=" + encodeURIComponent(magic.code);
    },
    getLoginUrl: function (magic) {
        return "/login?code=" + encodeURIComponent(magic.code);
    },
};
