"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
var moment_1 = __importDefault(require("moment"));
var Time = /** @class */ (function () {
    function Time() {
    }
    Time.prototype.now = function () {
        // We prefer to use timestamptz and keep everything in utc
        return moment_1.default.utc().format();
    };
    Time.prototype.timestamptzPlusMillis = function (timestamptz, millis) {
        var startMoment = moment_1.default(timestamptz).utc();
        millis = typeof millis === 'number' ? millis : parseInt(millis);
        return moment_1.default(startMoment.valueOf() + millis)
            .utc()
            .format();
    };
    Time.prototype.timestamptzStillCurrent = function (timestamptz) {
        // timestamptz = A moment in the future that should
        // be ahead of the present => greater comparison
        return (!timestamptz || moment_1.default(timestamptz).valueOf() > moment_1.default.utc().valueOf());
    };
    Time.prototype.timestamptzHasPassed = function (timestamptz) {
        // timestamptz = A moment in time in the past that is
        // before now => less comparison
        return (timestamptz && moment_1.default(timestamptz).valueOf() < moment_1.default.utc().valueOf());
    };
    Time.prototype.isTimestamptzAfter = function (timestamptz1, timestamptz2) {
        return moment_1.default(timestamptz1).valueOf() > moment_1.default(timestamptz2).valueOf();
    };
    return Time;
}());
exports.Time = Time;
exports.default = new Time();
