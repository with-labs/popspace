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
exports.Accounts = void 0;
var otp_1 = __importDefault(require("../lib/otp"));
var events_1 = __importDefault(require("./events"));
var prisma_1 = __importDefault(require("./prisma"));
var time_1 = __importDefault(require("./time"));
var LOGIN_REQUEST_EXPIRY_DAYS = 30;
var SIGNUP_REQUEST_EXPIRY_DAYS = 30;
var Accounts = /** @class */ (function () {
    function Accounts() {
    }
    Accounts.prototype.delete = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.actor.update({
                            where: { id: actorId },
                            data: { deletedAt: time_1.default.now() },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Accounts.prototype.hardDelete = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var actor, createdRooms, roomIds, membershipsToOwnedRooms, membershipsToOwnedRoomsIds, widgets, widgetIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.actor.findUnique({ where: { id: actorId } })];
                    case 1:
                        actor = _a.sent();
                        if (!actor || !actor.deletedAt) {
                            throw 'No such actor - can only hard delete soft deleted actors.';
                        }
                        return [4 /*yield*/, prisma_1.default.room.findMany({
                                where: {
                                    creatorId: actorId,
                                },
                            })];
                    case 2:
                        createdRooms = _a.sent();
                        roomIds = createdRooms.map(function (r) { return r.id; });
                        return [4 /*yield*/, prisma_1.default.roomMembership.findMany({
                                where: {
                                    roomId: {
                                        in: roomIds,
                                    },
                                },
                            })];
                    case 3:
                        membershipsToOwnedRooms = _a.sent();
                        membershipsToOwnedRoomsIds = membershipsToOwnedRooms.map(function (m) { return m.id; });
                        return [4 /*yield*/, prisma_1.default.widget.findMany({
                                where: { creatorId: actorId },
                            })];
                    case 4:
                        widgets = _a.sent();
                        widgetIds = widgets.map(function (w) { return w.id; });
                        return [4 /*yield*/, prisma_1.default.$transaction([
                                prisma_1.default.actor.delete({ where: { id: actorId } }),
                                prisma_1.default.session.deleteMany({ where: { actorId: actorId } }),
                                prisma_1.default.magicCode.deleteMany({ where: { actorId: actorId } }),
                                // All room membership info
                                prisma_1.default.roomMembership.deleteMany({ where: { actorId: actorId } }),
                                // All actors rooms, their members and metainfo
                                prisma_1.default.roomMembership.deleteMany({
                                    where: { id: { in: membershipsToOwnedRoomsIds } },
                                }),
                                prisma_1.default.room.deleteMany({ where: { creatorId: actorId } }),
                                prisma_1.default.widget.deleteMany({ where: { creatorId: actorId } }),
                                prisma_1.default.widgetTransform.deleteMany({
                                    where: { widgetId: { in: widgetIds } },
                                }),
                                prisma_1.default.widgetState.deleteMany({ where: { widgetId: { in: widgetIds } } }),
                                prisma_1.default.participant.deleteMany({ where: { actorId: actorId } }),
                                prisma_1.default.participantState.delete({ where: { actorId: actorId } }),
                                prisma_1.default.participantTransform.deleteMany({ where: { actorId: actorId } }),
                            ])];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // TODO: delete? Actors don't have emails.
    // async actorByEmail(email: string) {
    //   const actor = await prisma.actor.findFirst({
    //     where: {
    //       email: args.consolidateEmailString(email),
    //     },
    //   });
    //   if (actor.deletedAt) return null;
    //   return actor;
    // }
    // actorsByEmails(emails) {
    //   const consolidatedEmails = emails.map((e) =>
    //     // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    //     shared.lib.args.consolidateEmailString(e),
    //   );
    //   return prisma.actor.findMany({
    //     where: {
    //       email: { in: consolidatedEmails },
    //       deletedAt: null,
    //     },
    //   });
    // }
    Accounts.prototype.actorById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var actor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.actor.findUnique({ where: { id: id } })];
                    case 1:
                        actor = _a.sent();
                        if (actor.deletedAt)
                            return [2 /*return*/, null];
                        return [2 /*return*/, actor];
                }
            });
        });
    };
    Accounts.prototype.createActor = function (kind, source, expressRequest) {
        return prisma_1.default.actor.create({
            data: {
                kind: kind,
                events: {
                    create: events_1.default.eventFromRequest(undefined, null, 'sourced', source, expressRequest),
                },
            },
        });
    };
    // TODO: typing for actor based on existing usage
    Accounts.prototype.createLoginRequest = function (actor) {
        return __awaiter(this, void 0, void 0, function () {
            var loginRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginRequest = {
                            code: otp_1.default.generate(),
                            issuedAt: time_1.default.now(),
                            expiresAt: otp_1.default.expirationInNDays(LOGIN_REQUEST_EXPIRY_DAYS),
                            actorId: actor.id,
                            action: 'login',
                        };
                        return [4 /*yield*/, prisma_1.default.magicCode.create({ data: loginRequest })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Accounts.prototype.createSession = function (actorId, tx, req) {
        if (tx === void 0) { tx = null; }
        if (req === void 0) { req = null; }
        return __awaiter(this, void 0, void 0, function () {
            var session, meta, eventValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.session.create({
                            data: {
                                actorId: actorId,
                                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
                                secret: shared.lib.otp.generate(),
                                expiresAt: null,
                            },
                        })];
                    case 1:
                        session = _a.sent();
                        meta = null;
                        eventValue = null;
                        return [4 /*yield*/, events_1.default.recordEvent(actorId, session.id, 'session', eventValue, req, meta)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, session];
                }
            });
        });
    };
    // TODO: email subscriptions, again.
    Accounts.prototype.newsletterSubscribe = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    Accounts.prototype.newsletterUnsubscribe = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return Accounts;
}());
exports.Accounts = Accounts;
exports.default = new Accounts();
