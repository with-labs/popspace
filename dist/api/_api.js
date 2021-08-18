"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("./http"));
var middleware_1 = __importDefault(require("./middleware"));
exports.default = {
    middleware: middleware_1.default,
    http: http_1.default,
};
