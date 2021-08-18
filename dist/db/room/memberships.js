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
exports.Memberships = void 0;
var _error_1 = __importDefault(require("../../error/_error"));
var _models_1 = __importDefault(require("../../models/_models"));
var prisma_1 = __importDefault(require("../prisma"));
var time_1 = __importDefault(require("../time"));
var Memberships = /** @class */ (function () {
    function Memberships() {
        var _this = this;
        // TODO: typing of actor based on existing usage
        this.forceMembership = function (room, actor) { return __awaiter(_this, void 0, void 0, function () {
            var existingMembership, expiresAt, membership, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMembership(actor.id, room.id)];
                    case 1:
                        existingMembership = _a.sent();
                        if (existingMembership) {
                            return [2 /*return*/, existingMembership];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        expiresAt = null;
                        return [4 /*yield*/, prisma_1.default.roomMembership.create({
                                data: {
                                    roomId: room.id,
                                    actorId: actor.id,
                                    beganAt: time_1.default.now(),
                                    expiresAt: expiresAt,
                                },
                            })];
                    case 3:
                        membership = _a.sent();
                        return [2 /*return*/, { membership: membership }];
                    case 4:
                        e_1 = _a.sent();
                        // TODO: ERROR_LOGGING
                        return [2 /*return*/, { error: _error_1.default.code.UNEXPECTED_ERROR }];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
    }
    Memberships.prototype.isMember = function (actorId, roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var membership, current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMembership(actorId, roomId)];
                    case 1:
                        membership = _a.sent();
                        if (!membership) {
                            return [2 /*return*/, false];
                        }
                        current = time_1.default.timestamptzStillCurrent(membership.expiresAt);
                        return [2 /*return*/, current];
                }
            });
        });
    };
    Memberships.prototype.getMembership = function (actorId, roomId) {
        return prisma_1.default.roomMembership.findFirst({
            where: {
                actorId: actorId,
                roomId: roomId,
                revokedAt: null,
                beganAt: {
                    not: null,
                },
            },
            /*
              There's some optionality here.
              E.g. we could choose the membership that will
              expire the most in the future, though
              not all memberships expire. Perhaps those
              are the best to choose among non-revoked ones anyway.
              On the other hand if we choose the latest issued one,
              seems like that's the one we should give, since
              for whatever reason that membership was accepted.
              In practice, we should only have 1 active membership
              per person anyway.
            */
            orderBy: {
                beganAt: 'desc',
            },
        });
    };
    Memberships.prototype.getRoomMembers = function (roomId) {
        return _models_1.default.RoomMember.allInRoom(roomId);
    };
    Memberships.prototype.revokeMembership = function (roomId, actorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.roomMembership.updateMany({
                        where: {
                            actorId: actorId,
                            roomId: roomId,
                            revokedAt: null,
                        },
                        data: { revokedAt: time_1.default.now() },
                    })];
            });
        });
    };
    return Memberships;
}());
exports.Memberships = Memberships;
exports.default = new Memberships();
