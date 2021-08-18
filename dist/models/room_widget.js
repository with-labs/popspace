"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var accounts_1 = __importDefault(require("../db/accounts"));
var messages_1 = __importDefault(require("../db/messages/messages"));
var prisma_1 = __importDefault(require("../db/prisma"));
var RoomWidget = /** @class */ (function () {
    function RoomWidget(roomId, pgWidget, widgetState, roomWidgetState, creatorDisplayName) {
        this._roomId = roomId;
        this._pgWidget = pgWidget;
        this._widgetState = widgetState;
        this._roomWidgetState = roomWidgetState;
        this._creatorDisplayName = creatorDisplayName;
    }
    RoomWidget.prototype.widgetId = function () {
        return this._pgWidget.id;
    };
    RoomWidget.prototype.widgetState = function () {
        return this._widgetState.state || {};
    };
    RoomWidget.prototype.roomWidgetState = function () {
        return this._roomWidgetState.state;
    };
    RoomWidget.prototype.roomId = function () {
        return this._roomId;
    };
    RoomWidget.prototype.creatorId = function () {
        return this._pgWidget.creatorId;
    };
    RoomWidget.prototype.setCreator = function (creator) {
        if (!creator) {
            if (this.creatorId()) {
                return;
            }
            else {
                throw "Invalid null creator - expected creator with id " + this.creatorId();
            }
        }
        if (creator.id != this.creatorId()) {
            throw "Invalid creator (expected " + this.creatorId() + ", got " + (creator ? creator.id : null);
        }
        this._creator = creator;
    };
    // FIXME: this seems gross
    RoomWidget.prototype.creator = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        _b = this._creator;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, accounts_1.default.actorById(this.creatorId())];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2: return [2 /*return*/, (_a._creator =
                            _b ||
                                {})];
                }
            });
        });
    };
    RoomWidget.prototype.creatorDisplayName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        _b = this._creatorDisplayName;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.creator()];
                    case 1:
                        _b = (_c.sent()).displayName;
                        _c.label = 2;
                    case 2: return [2 /*return*/, (_a._creatorDisplayName = _b)];
                }
            });
        });
    };
    RoomWidget.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var baseWidgetData, associatedMessages;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {
                            widget_id: this._pgWidget.id,
                            creator_id: this._pgWidget.creatorId,
                            type: this._pgWidget.type,
                            widget_state: this.widgetState()
                        };
                        return [4 /*yield*/, this.creatorDisplayName()];
                    case 1:
                        baseWidgetData = (_a.creator_display_name = _b.sent(),
                            _a.transform = this.roomWidgetState(),
                            _a);
                        if (!(this._pgWidget.type === 'CHAT')) return [3 /*break*/, 3];
                        return [4 /*yield*/, messages_1.default.getNextPageMessages(this._pgWidget.id, null)];
                    case 2:
                        associatedMessages = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, baseWidgetData), { messages: associatedMessages })];
                    case 3: return [2 /*return*/, baseWidgetData];
                }
            });
        });
    };
    RoomWidget.fromWidgetId = function (widgetId, roomId) { return __awaiter(void 0, void 0, void 0, function () {
        var pgWidget, widgetState, roomWidgetState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.widget.findUnique({
                        where: { id: widgetId },
                        include: { creator: { select: { displayName: true } } },
                    })];
                case 1:
                    pgWidget = _a.sent();
                    return [4 /*yield*/, prisma_1.default.widgetState.findUnique({
                            where: { widgetId: widgetId },
                        })];
                case 2:
                    widgetState = _a.sent();
                    return [4 /*yield*/, prisma_1.default.widgetTransform.findUnique({
                            where: { roomId_widgetId: { widgetId: widgetId, roomId: roomId } },
                        })];
                case 3:
                    roomWidgetState = _a.sent();
                    return [2 /*return*/, new RoomWidget(roomId, pgWidget, widgetState, roomWidgetState, pgWidget.creator.displayName)];
            }
        });
    }); };
    RoomWidget.allInRoom = function (roomId) { return __awaiter(void 0, void 0, void 0, function () {
        var widgets, result, _i, widgets_1, widget, widgetState, roomWidgetState, roomWidget;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.widget.findMany({
                        where: {
                            roomWidget: {
                                roomId: roomId,
                            },
                            deletedAt: null,
                            archivedAt: null,
                        },
                        include: {
                            creator: true,
                            widgetState: true,
                            transform: true,
                        },
                    })];
                case 1:
                    widgets = _a.sent();
                    result = [];
                    for (_i = 0, widgets_1 = widgets; _i < widgets_1.length; _i++) {
                        widget = widgets_1[_i];
                        widgetState = widget.widgetState || {};
                        roomWidgetState = widget.transform || {};
                        roomWidget = new RoomWidget(roomId, widget, widgetState, roomWidgetState, widget.creator.displayName);
                        result.push(roomWidget);
                    }
                    return [2 /*return*/, result];
            }
        });
    }); };
    return RoomWidget;
}());
exports.default = RoomWidget;
