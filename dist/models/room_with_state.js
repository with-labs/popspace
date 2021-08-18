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
var _room_1 = __importDefault(require("../db/room/_room"));
var DEFAULT_WALLPAPER_URL = 'https://s3-us-west-2.amazonaws.com/with.wallpapers/farrah_yoo_1609883525.jpg';
var getDefaultRoomState = function (room) {
    return {
        state: {
            /*
              Not all rooms were created with a default state in dynamo.
              We can later backfill these, and make sure new ones are created with a state.
              Until then, we can just have a default state set in code.
            */
            wallpaperUrl: DEFAULT_WALLPAPER_URL,
            displayName: room && room.displayName ? room.displayName : 'room',
            zOrder: [],
        },
    };
};
var RoomWithState = /** @class */ (function () {
    function RoomWithState(pgRoom, roomState) {
        this._pgRoom = pgRoom;
        this._roomState = roomState;
    }
    RoomWithState.prototype.roomId = function () {
        return this._pgRoom.id;
    };
    RoomWithState.prototype.urlId = function () {
        return this._pgRoom.urlId;
    };
    RoomWithState.prototype.creatorId = function () {
        return this._pgRoom.creatorId;
    };
    RoomWithState.prototype.displayName = function () {
        return this._pgRoom.displayName;
    };
    RoomWithState.prototype.route = function () {
        return _room_1.default.namesAndRoutes.route(this.displayName(), this.urlId());
    };
    RoomWithState.prototype.roomState = function () {
        return this._roomState.state;
    };
    RoomWithState.prototype.previewImageUrl = function () {
        var wallpaperUrl = this.roomState().wallpaperUrl || DEFAULT_WALLPAPER_URL;
        /* Only accept true - must explicitly specify custom */
        if (this.roomState().isCustomWallpaper == true) {
            // For actor-submitted wallpapers, have to render their wallpaper
            return wallpaperUrl;
        }
        else {
            // For our own wallpapers, we create thumbnails
            var wallpaperUrlComponents = wallpaperUrl.split('/');
            var filename = wallpaperUrlComponents[wallpaperUrlComponents.length - 1];
            var filenameComponents = filename.split('.');
            wallpaperUrlComponents.pop();
            return wallpaperUrlComponents.join('/') + "/" + filenameComponents[0] + "_thumb." + filenameComponents[1];
        }
    };
    RoomWithState.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        roomId: this.roomId(),
                        creatorId: this.creatorId(),
                        previewImageUrl: this.previewImageUrl(),
                        displayName: this.displayName(),
                        route: this.route(),
                        urlId: this.urlId(),
                    }];
            });
        });
    };
    // FIXME: this looks horribly inefficient with n+1 queries
    RoomWithState.allVisitableForActorId = function (actorId) { return __awaiter(void 0, void 0, void 0, function () {
        var created, member;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, _index_1.default.room.core.getCreatedRoutableRooms(actorId)];
                case 1:
                    created = _b.sent();
                    return [4 /*yield*/, _index_1.default.room.core.getMemberRoutableRooms(actorId)];
                case 2:
                    member = _b.sent();
                    _a = {};
                    return [4 /*yield*/, Promise.all(created.map(function (r) { return RoomWithState.fromRoomId(r.id); }))];
                case 3:
                    _a.created = _b.sent();
                    return [4 /*yield*/, Promise.all(member.map(function (r) { return RoomWithState.fromRoomId(r.roomId); }))];
                case 4: return [2 /*return*/, (_a.member = _b.sent(),
                        _a)];
            }
        });
    }); };
    RoomWithState.fromRoomId = function (roomId) { return __awaiter(void 0, void 0, void 0, function () {
        var pgRoom, roomState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _index_1.default.room.core.roomById(roomId)];
                case 1:
                    pgRoom = _a.sent();
                    if (!pgRoom) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, _index_1.default.room.data.getRoomState(roomId)];
                case 2:
                    roomState = _a.sent();
                    return [2 /*return*/, new RoomWithState(pgRoom, roomState)];
            }
        });
    }); };
    RoomWithState.fromRooms = function (rooms) { return __awaiter(void 0, void 0, void 0, function () {
        var result, promises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    promises = rooms.map(function (room, index) { return __awaiter(void 0, void 0, void 0, function () {
                        var state;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, _index_1.default.room.data.getRoomState(room.id)];
                                case 1:
                                    state = _a.sent();
                                    state = state || getDefaultRoomState(room);
                                    result[index] = new RoomWithState(room, state);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, result];
            }
        });
    }); };
    return RoomWithState;
}());
exports.default = RoomWithState;
