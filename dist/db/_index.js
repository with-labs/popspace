"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var accounts_1 = __importDefault(require("./accounts"));
var config_1 = __importDefault(require("./config"));
var constants = __importStar(require("./constants"));
var dynamo_1 = __importDefault(require("./dynamo/dynamo"));
var events_1 = __importDefault(require("./events"));
var experience_ratings_1 = __importDefault(require("./experience_ratings"));
var magic_1 = __importDefault(require("./magic"));
var messages_1 = __importDefault(require("./messages/messages"));
var pg_1 = __importDefault(require("./pg"));
var prisma_1 = __importDefault(require("./prisma"));
var _redis_1 = __importDefault(require("./redis/_redis"));
var _room_1 = __importDefault(require("./room/_room"));
var serialization_1 = __importDefault(require("./serialization"));
var time_1 = __importDefault(require("./time"));
var wallpapers_1 = __importDefault(require("./wallpapers"));
exports.default = {
    config: config_1.default,
    pg: pg_1.default,
    prisma: prisma_1.default,
    time: time_1.default,
    accounts: accounts_1.default,
    events: events_1.default,
    room: _room_1.default,
    dynamo: dynamo_1.default,
    redis: _redis_1.default,
    magic: magic_1.default,
    experienceRatings: experience_ratings_1.default,
    wallpapers: wallpapers_1.default,
    messages: messages_1.default,
    serialization: serialization_1.default,
    constants: constants,
};
