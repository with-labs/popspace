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
exports.Core = void 0;
var prisma_1 = __importDefault(require("../prisma"));
var time_1 = __importDefault(require("../time"));
var names_and_routes_1 = __importDefault(require("./names_and_routes"));
var templates_1 = __importDefault(require("./templates"));
var Core = /** @class */ (function () {
    function Core() {
    }
    /********************* GETTERS *******************/
    Core.prototype.roomById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.findUnique({ where: { id: id } })];
                    case 1:
                        room = _a.sent();
                        if (!room || room.deletedAt)
                            return [2 /*return*/, null];
                        return [2 /*return*/, room];
                }
            });
        });
    };
    Core.prototype.roomByUrlId = function (urlId) {
        return __awaiter(this, void 0, void 0, function () {
            var room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.findUnique({ where: { urlId: urlId } })];
                    case 1:
                        room = _a.sent();
                        if (!room || room.deletedAt)
                            return [2 /*return*/, null];
                        return [2 /*return*/, room];
                }
            });
        });
    };
    Core.prototype.roomByRoute = function (route) {
        return __awaiter(this, void 0, void 0, function () {
            var urlId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlId = names_and_routes_1.default.urlIdFromRoute(route);
                        return [4 /*yield*/, this.roomByUrlId(urlId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Core.prototype.routableRoomById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /*
                  TODO: At this point, this should return a model,
                  or be deleted altogether - perhaps a model constructor
                  would work better
                */
                return [2 /*return*/, this.roomById(id)];
            });
        });
    };
    Core.prototype.getCreatedRoutableRooms = function (actorId) {
        return prisma_1.default.room.findMany({
            select: {
                id: true,
                creatorId: true,
                displayName: true,
                urlId: true,
            },
            where: {
                creatorId: actorId,
                deletedAt: null,
            },
            orderBy: {
                id: 'desc',
            },
        });
    };
    Core.prototype.getMemberRoutableRooms = function (actorId) {
        return __awaiter(this, void 0, void 0, function () {
            var records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.roomMembership.findMany({
                            where: {
                                actorId: actorId,
                                revokedAt: null,
                                room: {
                                    deletedAt: null,
                                },
                            },
                            select: {
                                roomId: true,
                                createdAt: true,
                                room: {
                                    select: {
                                        displayName: true,
                                        creatorId: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        })];
                    case 1:
                        records = _a.sent();
                        // FIXME: this renaming isn't necessary and introduces
                        // inconsistency, refactor it out
                        return [2 /*return*/, records.map(function (record) {
                                return {
                                    roomId: record.roomId,
                                    memberAsOf: record.createdAt,
                                    displayName: record.room.displayName,
                                    creatorId: record.room.creatorId,
                                };
                            })];
                }
            });
        });
    };
    /*********************************** MODIFIERS ****************************/
    /**
     * Create a room using provided template data.
     * @param {TemplateData} template
     * @param {number} creatorId - may be deprecated as we move to anon actors
     */
    Core.prototype.createRoomFromTemplate = function (templateName, template, creatorId, isPublic) {
        if (isPublic === void 0) { isPublic = true; }
        return __awaiter(this, void 0, void 0, function () {
            var templateData, templateRow, room, roomData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        templateData = template;
                        if (!!templateData) return [3 /*break*/, 2];
                        return [4 /*yield*/, prisma_1.default.roomTemplate.findUnique({
                                where: { name: templateName },
                            })];
                    case 1:
                        templateRow = _a.sent();
                        if (!templateRow) {
                            throw new Error("No template found for name " + templateName);
                        }
                        templateData = templateRow.data;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.createRoom(creatorId, templateData.displayName || 'New Meeting', templateName, isPublic)];
                    case 3:
                        room = _a.sent();
                        return [4 /*yield*/, templates_1.default.setUpRoomFromTemplate(room.id, templateData)];
                    case 4:
                        roomData = _a.sent();
                        return [2 /*return*/, { room: room, roomData: roomData }];
                }
            });
        });
    };
    Core.prototype.createRoom = function (creatorId, displayName, templateName, isPublic) {
        if (isPublic === void 0) { isPublic = true; }
        return __awaiter(this, void 0, void 0, function () {
            var urlId, room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, names_and_routes_1.default.generateUniqueRoomUrlId()];
                    case 1:
                        urlId = _a.sent();
                        return [4 /*yield*/, prisma_1.default.room.create({
                                data: {
                                    creatorId: creatorId,
                                    isPublic: isPublic,
                                    urlId: urlId,
                                    displayName: displayName,
                                    templateName: templateName,
                                },
                            })];
                    case 2:
                        room = _a.sent();
                        return [2 /*return*/, room];
                }
            });
        });
    };
    Core.prototype.createEmptyRoom = function (creatorId, isPublic, displayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createRoomFromTemplate('empty', templates_1.default.empty(), creatorId, isPublic)];
            });
        });
    };
    Core.prototype.setDisplayName = function (roomId, newDisplayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.update({
                            where: { id: roomId },
                            data: {
                                displayName: newDisplayName,
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Core.prototype.deleteRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.update({
                            where: { id: roomId },
                            data: { deletedAt: time_1.default.now() },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Core.prototype.restoreRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.update({
                            where: { id: roomId },
                            data: { deletedAt: null },
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Core;
}());
exports.Core = Core;
exports.default = new Core();
