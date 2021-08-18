"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var args_1 = __importDefault(require("./args"));
var auth_1 = __importDefault(require("./auth"));
var otp_1 = __importDefault(require("./otp"));
var routes_1 = __importDefault(require("./routes"));
exports.default = {
    auth: auth_1.default,
    args: args_1.default,
    otp: otp_1.default,
    routes: routes_1.default,
};
