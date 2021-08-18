"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
var ua_parser_js_1 = __importDefault(require("ua-parser-js"));
var url_1 = __importDefault(require("url"));
var prisma_1 = __importDefault(require("./prisma"));
var reqToUrl = function (expressRequest) {
    if (!expressRequest.get) {
        return;
    }
    var protocol = expressRequest.protocol;
    var host = expressRequest.get('host');
    var pathname = expressRequest.originalUrl;
    if (!protocol || !host || !pathname) {
        return;
    }
    return url_1.default.format({ protocol: protocol, host: host, pathname: pathname });
};
var Events = /** @class */ (function () {
    function Events() {
        var _this = this;
        this.actorCreateEvent = function (actorId, sessionId, source, expressRequest) {
            var meta = null;
            var key = 'sourced';
            return _this.recordEvent(actorId, sessionId, key, source, expressRequest, meta);
        };
        this.roomCreateEvent = function (actorId, sessionId, templateName, expressRequest) {
            var meta = null;
            var key = 'room_create';
            return _this.recordEvent(actorId, sessionId, key, templateName, expressRequest, meta);
        };
        this.recordEvent = function (actorId, sessionId, key, value, expressRequest, meta) {
            if (expressRequest === void 0) { expressRequest = null; }
            if (meta === void 0) { meta = null; }
            return prisma_1.default.actorEvent.create({
                data: _this.eventFromRequest(actorId, sessionId, key, value, expressRequest, meta),
            });
        };
    }
    Events.prototype.eventFromRequest = function (actorId, sessionId, key, value, expressRequest, meta) {
        if (expressRequest === void 0) { expressRequest = null; }
        if (meta === void 0) { meta = null; }
        if (!expressRequest) {
            expressRequest = { headers: {}, socket: {} };
        }
        var ua = ua_parser_js_1.default(expressRequest.headers ? expressRequest.headers['user-agent'] : '');
        return {
            actorId: actorId,
            sessionId: sessionId,
            key: key,
            value: value !== undefined && value !== null ? value.toString() : value,
            meta: meta,
            ip: expressRequest.headers['x-forwarded-for'] ||
                expressRequest.socket.remoteAddress,
            browser: ua.browser.name,
            device: ua.device.type,
            vendor: ua.device.vendor,
            engine: ua.engine.name,
            os: ua.os.name,
            osVersion: ua.os.version,
            engineVersion: ua.engine.version,
            browserVersion: ua.browser.version,
            reqUrl: reqToUrl(expressRequest),
            userAgent: expressRequest.headers['user-agent'],
        };
    };
    return Events;
}());
exports.Events = Events;
exports.default = new Events();
