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
exports.Magic = void 0;
var _error_1 = __importDefault(require("../error/_error"));
var accounts_1 = __importDefault(require("./accounts"));
var prisma_1 = __importDefault(require("./prisma"));
/**
Manages life cycle of magic links.

Magic links permit executing various restricted access for
a given actor: e.g. unsubscribing from a mailing list.
*/
var Magic = /** @class */ (function () {
    function Magic() {
    }
    // TODO: remove async (unnecessary promise)
    Magic.prototype.unsubscribeUrl = function (appUrl, magicLink) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, appUrl + "/unsubscribe?code=" + magicLink.code];
            });
        });
    };
    Magic.prototype.createUnsubscribe = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLink;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.magicCode.findFirst({
                            where: {
                                actorId: actorId,
                                expiresAt: null,
                                resolvedAt: null,
                                action: Magic.actions.UNSUBSCRIBE,
                            },
                        })];
                    case 1:
                        existingLink = _a.sent();
                        if (existingLink) {
                            return [2 /*return*/, existingLink];
                        }
                        return [4 /*yield*/, prisma_1.default.magicCode.create({
                                data: {
                                    actorId: actorId,
                                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
                                    code: shared.lib.otp.generate(),
                                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
                                    issuedAt: shared.db.time.now(),
                                    /**
                                      According to the CAN SPAM guidelines
                                      https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
                                      unsubscribe links have to be active for at least 30 days.
                            
                                      But according to us and the internet, there is no reason to make these links expire
                                      https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
                                    */
                                    expiresAt: null,
                                    action: Magic.actions.UNSUBSCRIBE,
                                },
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Magic.prototype.createSubscribe = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var existingLink;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.magicCode.findFirst({
                            where: {
                                actorId: actorId,
                                expiresAt: null,
                                resolvedAt: null,
                                action: Magic.actions.SUBSCRIBE,
                            },
                        })];
                    case 1:
                        existingLink = _a.sent();
                        if (existingLink) {
                            return [2 /*return*/, existingLink];
                        }
                        return [4 /*yield*/, prisma_1.default.magicCode.create({
                                data: {
                                    actorId: actorId,
                                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
                                    code: shared.lib.otp.generate(),
                                    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
                                    issuedAt: shared.db.time.now(),
                                    /*
                                      It's ok to never expire these - as long as they don't log you in.
                                    */
                                    expiresAt: null,
                                    action: Magic.actions.SUBSCRIBE,
                                },
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Magic.prototype.magicLinkByCode = function (code) {
        return prisma_1.default.magicCode.findUnique({ where: { code: code } });
    };
    Magic.prototype.tryToResolveMagicLink = function (request, expectedAction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (request.action != expectedAction) {
                            return [2 /*return*/, { error: _error_1.default.code.MAGIC_CODE_INVALID_ACTION }];
                        }
                        _a = request.action;
                        switch (_a) {
                            case Magic.actions.UNSUBSCRIBE: return [3 /*break*/, 1];
                            case Magic.actions.SUBSCRIBE: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.unsubscribe(request)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.subscribe(request)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [2 /*return*/, { error: _error_1.default.code.MAGIC_CODE_INVALID_ACTION }];
                }
            });
        });
    };
    Magic.prototype.tryToUnsubscribe = function (request) {
        return this.tryToResolveMagicLink(request, Magic.actions.UNSUBSCRIBE);
    };
    Magic.prototype.tryToSubscribe = function (request) {
        return this.tryToResolveMagicLink(request, Magic.actions.SUBSCRIBE);
    };
    // Private
    Magic.prototype.unsubscribe = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireActor(request)];
                    case 1:
                        validation = _a.sent();
                        if (validation.error) {
                            return [2 /*return*/, validation];
                        }
                        // Usually we'd want to mark the magic link as expired in a transaction,
                        // but there is no reason to invalidate unsubscribe links.
                        // https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
                        return [4 /*yield*/, accounts_1.default.newsletterUnsubscribe(request.actorId)];
                    case 2:
                        // Usually we'd want to mark the magic link as expired in a transaction,
                        // but there is no reason to invalidate unsubscribe links.
                        // https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
                        _a.sent();
                        return [2 /*return*/, {}];
                }
            });
        });
    };
    Magic.prototype.subscribe = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var validation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requireActor(request)];
                    case 1:
                        validation = _a.sent();
                        if (validation.error) {
                            return [2 /*return*/, validation];
                        }
                        return [4 /*yield*/, accounts_1.default.newsletterSubscribe(request.actorId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {}];
                }
            });
        });
    };
    Magic.prototype.requireActor = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var actorId, actor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actorId = request.actorId;
                        return [4 /*yield*/, prisma_1.default.actor.findUnique({ where: { id: actorId } })];
                    case 1:
                        actor = _a.sent();
                        if (!actor) {
                            return [2 /*return*/, { error: _error_1.default.code.NO_SUCH_ACTOR }];
                        }
                        return [2 /*return*/, {}];
                }
            });
        });
    };
    Magic.actions = {
        UNSUBSCRIBE: 'unsubscribe',
        SUBSCRIBE: 'subscribe',
    };
    return Magic;
}());
exports.Magic = Magic;
exports.default = new Magic();
