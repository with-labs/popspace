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
exports.Data = void 0;
var _models_1 = __importDefault(require("../../models/_models"));
var prisma_1 = __importDefault(require("../prisma"));
var time_1 = __importDefault(require("../time"));
var getNewState = function (modelName, criteria, stateUpdate, curState) {
    if (curState === void 0) { curState = null; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!curState) return [3 /*break*/, 2];
                    return [4 /*yield*/, prisma_1.default[modelName].findUnique({
                            where: criteria,
                        })];
                case 1:
                    curState = (_a.sent()).state;
                    _a.label = 2;
                case 2: return [2 /*return*/, Object.assign(curState || {}, stateUpdate)];
            }
        });
    });
};
var Data = /** @class */ (function () {
    function Data() {
    }
    /************************************************/
    /****************** ROOM      *******************/
    /************************************************/
    // TODO: RoomState typing
    Data.prototype.setRoomState = function (roomId, newState) {
        return prisma_1.default.roomState.upsert({
            where: { roomId: roomId },
            create: { state: newState, roomId: roomId },
            update: { state: newState },
        });
    };
    Data.prototype.updateRoomState = function (roomId, stateUpdate, curState) {
        if (curState === void 0) { curState = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.setRoomState;
                        _b = [roomId];
                        return [4 /*yield*/, getNewState('roomState', { roomId: roomId }, stateUpdate, curState)];
                    case 1: return [2 /*return*/, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Data.prototype.getRoomState = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.roomState.findUnique({ where: { roomId: roomId } })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Data.prototype.getRoomWallpaperData = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRoomState(roomId)];
                    case 1:
                        state = _a.sent();
                        if (!state.wallpaperId)
                            return [2 /*return*/, null];
                        return [2 /*return*/, prisma_1.default.wallpaper.findUnique({
                                where: { id: BigInt(state.wallpaperId) },
                            })];
                }
            });
        });
    };
    /************************************************/
    /****************** PARTICIPANTS   **************/
    /************************************************/
    Data.prototype.getParticipantState = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.participantState.findUnique({
                            where: {
                                actorId: actorId,
                            },
                        })];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry ? entry.state : null];
                }
            });
        });
    };
    // TODO: ParticipantState typing
    Data.prototype.updateParticipantState = function (actorId, participantState, curState) {
        if (curState === void 0) { curState = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.setParticipantState;
                        _b = [actorId];
                        return [4 /*yield*/, getNewState('participantState', { actorId: actorId }, participantState, curState)];
                    case 1: return [2 /*return*/, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Data.prototype.setParticipantState = function (actorId, newState) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.participantState.upsert({
                            where: { actorId: actorId },
                            create: newState,
                            update: newState,
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.state];
                }
            });
        });
    };
    Data.prototype.getRoomParticipantState = function (roomId, actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.participantTransform.findUnique({
                            where: {
                                roomId_actorId: {
                                    roomId: roomId,
                                    actorId: actorId,
                                },
                            },
                        })];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry ? entry.state : null];
                }
            });
        });
    };
    Data.prototype.updateRoomParticipantState = function (roomId, actorId, stateUpdate, curState) {
        if (curState === void 0) { curState = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.setRoomParticipantState;
                        _b = [roomId,
                            actorId];
                        return [4 /*yield*/, getNewState('participantTransform', {
                                roomId_actorId: {
                                    roomId: roomId,
                                    actorId: actorId,
                                },
                            }, stateUpdate, curState)];
                    case 1: return [2 /*return*/, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Data.prototype.setRoomParticipantState = function (roomId, actorId, newState) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.participantTransform.upsert({
                            where: {
                                roomId_actorId: { roomId: roomId, actorId: actorId },
                            },
                            create: { roomId: roomId, actorId: actorId, state: newState },
                            update: { state: newState },
                        })];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry && entry.state];
                }
            });
        });
    };
    /************************************************/
    /****************** WIDGETS   *******************/
    /************************************************/
    // TODO: WidgetState typing
    // TODO: WidgetTransform typing
    // TODO: creator typing
    Data.prototype.addWidgetInRoom = function (creatorId, roomId, type, desiredWidgetState, desiredRoomWidgetState, creator) {
        if (creator === void 0) { creator = null; }
        return __awaiter(this, void 0, void 0, function () {
            var widget, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.widget.create({
                            data: {
                                creatorId: creatorId,
                                type: type,
                                roomWidget: {
                                    create: {
                                        roomId: roomId,
                                    },
                                },
                                widgetState: {
                                    create: {
                                        state: desiredWidgetState,
                                    },
                                },
                                transform: {
                                    create: {
                                        state: desiredRoomWidgetState,
                                        roomId: roomId,
                                    },
                                },
                            },
                            include: {
                                widgetState: true,
                                transform: true,
                                creator: {
                                    select: {
                                        displayName: true,
                                    },
                                },
                            },
                        })];
                    case 1:
                        widget = _a.sent();
                        model = new _models_1.default.RoomWidget(roomId, widget, widget.widgetState, widget.transform, widget.creator.displayName);
                        if (creator) {
                            model.setCreator(creator);
                        }
                        return [2 /*return*/, model];
                }
            });
        });
    };
    Data.prototype.softDeleteWidget = function (widgetId, deletingActorId) {
        if (deletingActorId === void 0) { deletingActorId = null; }
        return prisma_1.default.widget.update({
            where: { id: widgetId },
            data: {
                deletedAt: time_1.default.now(),
                deletedBy: deletingActorId,
            },
        });
    };
    Data.prototype.eraseWidget = function (widgetId) {
        return prisma_1.default.$transaction([
            prisma_1.default.widget.delete({ where: { id: widgetId } }),
            prisma_1.default.roomWidget.deleteMany({ where: { widgetId: widgetId } }),
            prisma_1.default.widgetState.delete({ where: { widgetId: widgetId } }),
            prisma_1.default.widgetTransform.deleteMany({ where: { widgetId: widgetId } }),
        ]);
    };
    Data.prototype.getRoomWidgetState = function (roomId, widgetId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.widgetTransform.findUnique({
                            where: {
                                roomId_widgetId: {
                                    roomId: roomId,
                                    widgetId: widgetId,
                                },
                            },
                        })];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry && entry.state];
                }
            });
        });
    };
    Data.prototype.updateRoomWidgetState = function (roomId, widgetId, stateUpdate, roomWidgetState) {
        if (roomWidgetState === void 0) { roomWidgetState = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.setRoomWidgetState;
                        _b = [roomId,
                            widgetId];
                        return [4 /*yield*/, getNewState('widgetTransform', {
                                roomId_widgetId: {
                                    roomId: roomId,
                                    widgetId: widgetId,
                                },
                            }, stateUpdate, roomWidgetState)];
                    case 1: return [2 /*return*/, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Data.prototype.setRoomWidgetState = function (roomId, widgetId, newState) {
        return prisma_1.default.widgetTransform.upsert({
            where: {
                roomId_widgetId: { roomId: roomId, widgetId: widgetId },
            },
            create: { roomId: roomId, widgetId: widgetId, state: newState },
            update: { state: newState },
        });
    };
    Data.prototype.getWidgetState = function (widgetId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.widgetState.findUnique({
                            where: { widgetId: widgetId },
                        })];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry.state];
                }
            });
        });
    };
    Data.prototype.updateWidgetState = function (widgetId, stateUpdate, widgetState) {
        if (widgetState === void 0) { widgetState = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.setWidgetState;
                        _b = [widgetId];
                        return [4 /*yield*/, getNewState('widgetState', { widgetId: widgetId }, stateUpdate, widgetState)];
                    case 1: return [2 /*return*/, _a.apply(this, _b.concat([_c.sent()]))];
                }
            });
        });
    };
    Data.prototype.setWidgetState = function (widgetId, newState) {
        return prisma_1.default.widgetState.upsert({
            where: { widgetId: widgetId },
            create: { widgetId: widgetId, state: newState },
            update: { state: newState },
        });
    };
    return Data;
}());
exports.Data = Data;
exports.default = new Data();
