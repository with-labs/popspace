"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _index_1 = __importDefault(require("../db/_index"));
var _error_1 = __importDefault(require("../error/_error"));
var auth_1 = __importDefault(require("../lib/auth"));
var _api_1 = __importDefault(require("./_api"));
var base64Decode = function (str) {
    return Buffer.from(str, 'base64').toString('utf-8');
};
var middleware = {
    getActor: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var authHeader, token, session, actorId, actor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    authHeader = req.headers.authorization;
                    if (!authHeader && req.headers.Authorization) {
                        authHeader = Array.isArray(req.headers.Authorization)
                            ? req.headers.Authorization[0]
                            : req.headers.Authorization;
                    }
                    token = authHeader && authHeader.startsWith('Bearer')
                        ? base64Decode(authHeader.replace('Bearer ', ''))
                        : null;
                    if (!token) {
                        return [2 /*return*/, next()];
                    }
                    return [4 /*yield*/, auth_1.default.sessionFromToken(token)];
                case 1:
                    session = _a.sent();
                    if (!session) {
                        return [2 /*return*/, next()];
                    }
                    actorId = session.actorId;
                    return [4 /*yield*/, _index_1.default.accounts.actorById(actorId)];
                case 2:
                    actor = _a.sent();
                    if (!actor) {
                        return [2 /*return*/, next()];
                    }
                    req.actor = actor;
                    req.session = session;
                    next();
                    return [2 /*return*/];
            }
        });
    }); },
    getIp: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            /*
              https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
            */
            req.ip =
                req.headers['x-forwarded-for'] ||
                    (req.connection ? req.connection.remoteAddress : null);
            next();
            return [2 /*return*/];
        });
    }); },
    requireActor: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!req.actor) {
                return [2 /*return*/, next({
                        errorCode: _error_1.default.code.SESSION_REQUIRED,
                        message: 'Must have a valid session',
                        httpCode: _api_1.default.http.code.UNAUTHORIZED,
                    })];
            }
            next();
            return [2 /*return*/];
        });
    }); },
    roomFromRoute: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var roomRoute, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    roomRoute = req.body.room_route || req.body.roomRoute;
                    if (!roomRoute) {
                        return [2 /*return*/, next({
                                errorCode: _error_1.default.code.INVALID_API_PARAMS,
                                message: 'Must provide room_route',
                            }, _api_1.default.http.code.BAD_REQUEST)];
                    }
                    _a = req;
                    return [4 /*yield*/, _index_1.default.room.core.roomByRoute(roomRoute)];
                case 1:
                    _a.room = _b.sent();
                    next();
                    return [2 /*return*/];
            }
        });
    }); },
    requireRoom: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!req.room) {
                return [2 /*return*/, next({ errorCode: _error_1.default.code.UNKNOWN_ROOM, message: 'Unknown room' }, _api_1.default.http.code.BAD_REQUEST)];
            }
            next();
            return [2 /*return*/];
        });
    }); },
    requireRoomCreator: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (req.actor.id != req.room.creatorId) {
                return [2 /*return*/, next({
                        errorCode: _error_1.default.code.PERMISSION_DENIED,
                        message: 'Insufficient permission',
                        httpCode: _api_1.default.http.code.UNAUTHORIZED,
                    })];
            }
            next();
            return [2 /*return*/];
        });
    }); },
    requireRoomMember: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var isMember;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _index_1.default.room.permissions.isMember(req.user, req.room)];
                case 1:
                    isMember = _a.sent();
                    if (!isMember) {
                        return [2 /*return*/, next({
                                errorCode: _error_1.default.code.PERMISSION_DENIED,
                                message: 'Insufficient permission',
                                httpCode: _api_1.default.http.code.UNAUTHORIZED,
                            })];
                    }
                    next();
                    return [2 /*return*/];
            }
        });
    }); },
    requireRoomMemberOrCreator: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var isMemberOrCreator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _index_1.default.room.permissions.isMemberOrCreator(req.actor, req.room)];
                case 1:
                    isMemberOrCreator = _a.sent();
                    if (!isMemberOrCreator) {
                        return [2 /*return*/, next({
                                errorCode: _error_1.default.code.PERMISSION_DENIED,
                                message: 'Insufficient permission',
                                httpCode: _api_1.default.http.code.UNAUTHORIZED,
                            })];
                    }
                    next();
                    return [2 /*return*/];
            }
        });
    }); },
    requireAdmin: function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!req.actor || !req.actor.admin) {
                return [2 /*return*/, next({
                        errorCode: _error_1.default.code.PERMISSION_DENIED,
                        message: 'Insufficient permission',
                        httpCode: _api_1.default.http.code.UNAUTHORIZED,
                    })];
            }
            next();
            return [2 /*return*/];
        });
    }); },
};
exports.default = middleware;
