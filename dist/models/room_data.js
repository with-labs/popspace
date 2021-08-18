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
var _room_1 = __importDefault(require("../db/room/_room"));
var _models_1 = __importDefault(require("./_models"));
/*
  All the data stored in a room (widgets, participants, wallpaper...)
*/
var RoomData = /** @class */ (function () {
    function RoomData(room) {
        this.room = room;
    }
    Object.defineProperty(RoomData.prototype, "roomId", {
        get: function () {
            return this.room.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoomData.prototype, "urlId", {
        get: function () {
            return this.room.urlId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoomData.prototype, "route", {
        get: function () {
            return _room_1.default.namesAndRoutes.route(this.displayName, this.urlId);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RoomData.prototype, "displayName", {
        get: function () {
            return this.room.displayName;
        },
        enumerable: false,
        configurable: true
    });
    RoomData.prototype.widgets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _models_1.default.RoomWidget.allInRoom(this.roomId)];
            });
        });
    };
    RoomData.prototype.state = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _room_1.default.data.getRoomState(this.roomId)];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry.state];
                }
            });
        });
    };
    RoomData.prototype.wallpaper = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _room_1.default.data.getRoomWallpaperData(this.roomId)];
                    case 1:
                        entry = _a.sent();
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    RoomData.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _c = {
                            id: this.roomId,
                            displayName: this.displayName,
                            route: this.route,
                            urlId: this.urlId
                        };
                        _b = (_a = Promise).all;
                        return [4 /*yield*/, this.widgets()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [(_d.sent()).map(function (w) { return w.serialize(); })])];
                    case 2:
                        _c.widgets = (_d.sent()) ||
                            [];
                        return [4 /*yield*/, this.state()];
                    case 3:
                        _c.state = (_d.sent()) || {};
                        return [4 /*yield*/, this.wallpaper()];
                    case 4: return [2 /*return*/, (_c.wallpaper = _d.sent(),
                            _c)];
                }
            });
        });
    };
    return RoomData;
}());
exports.default = RoomData;
