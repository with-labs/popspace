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
exports.Auth = void 0;
var moment_1 = __importDefault(require("moment"));
var prisma_1 = __importDefault(require("../db/prisma"));
var Auth = /** @class */ (function () {
    function Auth() {
    }
    Auth.prototype.actorFromToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var actor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.actorAndSessionFromToken(token)];
                    case 1:
                        actor = (_a.sent()).actor;
                        return [2 /*return*/, actor];
                }
            });
        });
    };
    Auth.prototype.actorAndSessionFromToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var session, actor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sessionFromToken(token)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            return [2 /*return*/, {}];
                        }
                        return [4 /*yield*/, prisma_1.default.actor.findUnique({
                                where: { id: session.actorId },
                            })];
                    case 2:
                        actor = _a.sent();
                        if (actor.deletedAt) {
                            actor = null;
                        }
                        return [2 /*return*/, { actor: actor, session: session }];
                }
            });
        });
    };
    Auth.prototype.tokenFromSession = function (session) {
        /*
          At scale, we should use an O(1) store keyed on secrets,
          since btrees on random strings are quite inefficient (i.e.
          postgres is inefficient for session tokens).
    
          I thought about adding the actor or session ID to the token
          to speed up the query search.
    
          It'd work! But I think we don't want to leak our internal
          primary (enumerable) IDs. When we're at scale, we should be in
          an O(1) store for sessions anyway, so performance doesn't matter.
        */
        if (session) {
            return session.secret;
        }
    };
    Auth.prototype.sessionFromToken = function (sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!sessionToken) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, prisma_1.default.session.findFirst({
                                where: { secret: sessionToken },
                            })];
                    case 1:
                        session = _a.sent();
                        if (!session || this.isExpired(session)) {
                            return [2 /*return*/, null];
                        }
                        else {
                            return [2 /*return*/, session];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Auth.prototype.isExpired = function (entity) {
        if (!entity.expiresAt)
            return false;
        return moment_1.default(entity.expiresAt).valueOf() < moment_1.default.utc().valueOf();
    };
    // TODO: actor typings based on existing usage
    Auth.prototype.needsNewSessionToken = function (sessionToken, actor) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!sessionToken) {
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.sessionFromToken(sessionToken)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, session.actorId != BigInt(actor.id)];
                }
            });
        });
    };
    return Auth;
}());
exports.Auth = Auth;
exports.default = new Auth();
