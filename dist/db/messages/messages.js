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
exports.Messages = void 0;
var prisma_1 = __importDefault(require("../prisma"));
var MESSAGE_LIMIT = 30;
var Messages = /** @class */ (function () {
    function Messages() {
    }
    Messages.prototype.getWholeChat = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.message.findMany({
                            where: {
                                chatId: chatId,
                            },
                            select: {
                                sender: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                    },
                                },
                                id: true,
                                senderId: true,
                                chatId: true,
                                content: true,
                                createdAt: true,
                            },
                            orderBy: {
                                createdAt: 'asc',
                            },
                        })];
                    case 1:
                        results = _a.sent();
                        // TODO: transition to using sender object on messages instead of denormalizing senderDisplayName onto main object
                        return [2 /*return*/, results.map(function (message) {
                                message.senderDisplayName = message.sender.displayName;
                                return message;
                            })];
                }
            });
        });
    };
    Messages.prototype.getNextPageMessages = function (chatId, lastChatMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            var filter, messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = { chatId: chatId };
                        // for pages starting at a cursor, get ids less than the cursor id
                        if (lastChatMessageId) {
                            filter.id = { $lt: lastChatMessageId };
                        }
                        return [4 /*yield*/, prisma_1.default.message.findMany({
                                where: filter,
                                orderBy: {
                                    id: 'desc',
                                },
                                select: {
                                    id: true,
                                    content: true,
                                    createdAt: true,
                                    chatId: true,
                                    sender: {
                                        select: {
                                            id: true,
                                            displayName: true,
                                        },
                                    },
                                },
                                take: MESSAGE_LIMIT,
                            })];
                    case 1:
                        messages = _a.sent();
                        // id the query returns no messages, or if it returns less than the MESSAGE_LIMIT
                        // there are no messages left to get, so set hasMoreToLoad to false
                        return [2 /*return*/, {
                                hasMoreToLoad: !(messages.length < MESSAGE_LIMIT || messages.length === 0),
                                // reverse the order of the messages so that the most recent messages are first
                                messageList: messages.reverse().map(function (message) {
                                    // TODO: transition to using sender object on messages instead of denormalizing senderDisplayName onto main object
                                    message.senderDisplayName = message.sender.displayName;
                                    return message;
                                }),
                            }];
                }
            });
        });
    };
    return Messages;
}());
exports.Messages = Messages;
exports.default = new Messages();
