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
var accounts_1 = __importDefault(require("../accounts"));
var constants_1 = require("../constants");
var prisma_1 = __importDefault(require("../prisma"));
var data_1 = __importDefault(require("./data"));
var mockCreator;
var getMockCreator = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (mockCreator) {
                    return [2 /*return*/, mockCreator];
                }
                return [4 /*yield*/, accounts_1.default.actorById(constants_1.SYSTEM_USER_ID)];
            case 1:
                mockCreator = _a.sent();
                if (!!mockCreator) return [3 /*break*/, 3];
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                log.app.info("Creating mock actor with id " + constants_1.SYSTEM_USER_ID + " for creating widgets in room templates.");
                return [4 /*yield*/, prisma_1.default.actor.create({
                        data: {
                            id: constants_1.SYSTEM_USER_ID,
                            kind: 'system',
                            displayName: 'Tilde',
                            admin: true,
                        },
                    })];
            case 2:
                mockCreator = _a.sent();
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                log.app.info('Successfully created mock widget creator!', mockCreator);
                _a.label = 3;
            case 3: return [2 /*return*/, mockCreator];
        }
    });
}); };
/**
 * @typedef {Object} RoomState
 * @property {string} wallpaperUrl
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} TemplateData
 * @property {RoomState} state
 * @property {string} displayName
 * @property {Array} widgets - A tuple of [WidgetType, WidgetState, Transform]
 */
exports.default = {
    setUpRoomFromTemplate: function (roomId, templateData) { return __awaiter(void 0, void 0, void 0, function () {
        var creator, state, widgets, _i, _a, _b, type, widgetState, transform, roomWidget;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getMockCreator()];
                case 1:
                    creator = _d.sent();
                    state = __assign(__assign({}, templateData.state), { zOrder: [] });
                    return [4 /*yield*/, data_1.default.setRoomState(roomId, state)];
                case 2:
                    _d.sent();
                    widgets = [];
                    _i = 0, _a = templateData.widgets;
                    _d.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], type = _b[0], widgetState = _b[1], transform = _b[2];
                    return [4 /*yield*/, data_1.default.addWidgetInRoom(creator.id, roomId, type, widgetState, transform, creator)];
                case 4:
                    roomWidget = _d.sent();
                    widgets.push(roomWidget);
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    _c = {
                        state: state
                    };
                    return [4 /*yield*/, Promise.all(widgets.map(function (w) { return w.serialize(); }))];
                case 7: return [2 /*return*/, (_c.widgets = _d.sent(),
                        _c.id = roomId,
                        _c)];
            }
        });
    }); },
    empty: function (displayName) {
        if (displayName === void 0) { displayName = 'generated'; }
        return {
            displayName: displayName,
            state: {},
            widgets: [],
        };
    },
    createTemplate: function (templateName, data, creatorId) {
        if (creatorId === void 0) { creatorId = constants_1.SYSTEM_USER_ID; }
        return prisma_1.default.roomTemplate.create({
            data: {
                name: templateName,
                data: data,
                creatorId: creatorId,
            },
        });
    },
};
