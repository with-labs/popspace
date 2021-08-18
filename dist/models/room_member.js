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
var prisma_1 = __importDefault(require("../db/prisma"));
// FIXME: confusing, maybe broken typings
var RoomMember = /** @class */ (function () {
    function RoomMember(room, actor, participantState) {
        this.room = room;
        this.actor = actor;
        this.participantState = participantState;
    }
    Object.defineProperty(RoomMember.prototype, "roomId", {
        get: function () {
            return this.room.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoomMember.prototype, "actorId", {
        get: function () {
            return this.actor.id;
        },
        enumerable: false,
        configurable: true
    });
    RoomMember.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4 /*yield*/, this.actor.serialize()];
                    case 1:
                        _a.actor = _b.sent();
                        return [4 /*yield*/, this.room.serialize()];
                    case 2: return [2 /*return*/, (_a.room = _b.sent(),
                            _a.participantState = this.participantState,
                            _a)];
                }
            });
        });
    };
    return RoomMember;
}());
RoomMember.allInRoom = function (roomId) { return __awaiter(void 0, void 0, void 0, function () {
    var memberships, actorIds, actors, participantStates, actorById, participantStatesByActorId, _i, actors_1, actor, _a, participantStates_1, ps, room, result, _b, actorIds_1, actorId, roomMember;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma_1.default.roomMembership.findMany({
                    where: {
                        roomId: roomId,
                        revokedAt: null,
                    },
                })];
            case 1:
                memberships = _c.sent();
                actorIds = memberships.map(function (m) { return m.actorId; });
                return [4 /*yield*/, prisma_1.default.actor.findMany({
                        where: { id: { in: actorIds } },
                    })];
            case 2:
                actors = _c.sent();
                return [4 /*yield*/, prisma_1.default.participantState.findMany({
                        where: {
                            actorId: {
                                in: actorIds,
                            },
                        },
                    })];
            case 3:
                participantStates = _c.sent();
                actorById = {};
                participantStatesByActorId = {};
                for (_i = 0, actors_1 = actors; _i < actors_1.length; _i++) {
                    actor = actors_1[_i];
                    actorById[actor.id.toString()] = actor;
                }
                for (_a = 0, participantStates_1 = participantStates; _a < participantStates_1.length; _a++) {
                    ps = participantStates_1[_a];
                    participantStatesByActorId[ps.actorId.toString()] = ps;
                }
                return [4 /*yield*/, _index_1.default.room.core.roomById(roomId)];
            case 4:
                room = _c.sent();
                result = [];
                for (_b = 0, actorIds_1 = actorIds; _b < actorIds_1.length; _b++) {
                    actorId = actorIds_1[_b];
                    roomMember = new RoomMember(room, actorById[actorId.toString()], participantStatesByActorId[actorId.toString()]);
                    result.push(roomMember);
                }
                return [2 /*return*/, result];
        }
    });
}); };
exports.default = RoomMember;
