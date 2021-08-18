"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var config_1 = __importDefault(require("./config"));
var configToDbUrl = function (config) {
    return "postgresql://" + config.user + ":" + config.password + "@" + config.host + ":" + config.port + "/" + config.database;
};
var prisma = new client_1.PrismaClient({
    // @see https://github.com/prisma/prisma/issues/5533
    __internal: {
        // @ts-ignore
        useUds: true,
    },
    datasources: {
        db: {
            // connect the client to the database specified in the config for
            // the current environment
            url: configToDbUrl(config_1.default),
        },
    },
});
exports.default = prisma;
