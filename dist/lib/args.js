"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var args = {
    consolidateEmailString: function (email) {
        if (email) {
            return email.trim().toLowerCase();
        }
        return email;
    },
    multiSpaceToSingleSpace: function (str) {
        // https://stackoverflow.com/questions/3286874/remove-all-multiple-spaces-in-javascript-and-replace-with-single-space
        return str.replace(/ +(?= )/g, '');
    },
    multiDashToSingleDash: function (str) {
        return str.replace(/-+(?= )/g, '');
    },
};
exports.default = args;
