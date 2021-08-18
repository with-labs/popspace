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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDynamo = void 0;
var EmailDynamo = /** @class */ (function () {
    function EmailDynamo(dynamo, documentClient) {
        this.dynamo = dynamo;
        this.documentClient = documentClient;
    }
    EmailDynamo.prototype.createEmailsTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    TableName: 'sendable_emails',
                    KeySchema: [
                        { AttributeName: 'name', KeyType: 'HASH' },
                        { AttributeName: 'version', KeyType: 'RANGE' }, //Sort key
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'name', AttributeType: 'S' },
                        { AttributeName: 'version', AttributeType: 'N' },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 10,
                        WriteCapacityUnits: 10,
                    },
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.dynamo.createTable(params, function (err, data) {
                            if (err) {
                                console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
                                reject(err);
                            }
                            else {
                                console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EmailDynamo.prototype.listTables = function (limit) {
        if (limit === void 0) { limit = 256; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.dynamo.listTables({}, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EmailDynamo.prototype.deleteEmail = function (name, version) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    TableName: 'sendable_emails',
                    Key: {
                        name: name,
                        version: version,
                    },
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.documentClient.delete(params, function (err, data) {
                            if (err) {
                                console.error('Unable to delete entry. Error JSON:', JSON.stringify(err, null, 2));
                                reject(err);
                            }
                            else {
                                console.log('Deleted entry. Response:', JSON.stringify(data, null, 2));
                                resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    EmailDynamo.prototype.deleteEmailEntirely = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var emailHistory, _i, emailHistory_1, emailEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEmailVersionHistory(name)];
                    case 1:
                        emailHistory = _a.sent();
                        _i = 0, emailHistory_1 = emailHistory;
                        _a.label = 2;
                    case 2:
                        if (!(_i < emailHistory_1.length)) return [3 /*break*/, 5];
                        emailEntry = emailHistory_1[_i];
                        return [4 /*yield*/, this.deleteEmail(name, emailEntry.version)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EmailDynamo.prototype.createOrUpdateEmail = function (name, subject, html, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var version, lastVersion, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        version = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getLatestEmail(name)];
                    case 2:
                        lastVersion = _a.sent();
                        if (lastVersion) {
                            version = parseInt(lastVersion.version) + 1;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.addEmail(name, version, subject, html, plaintext)];
                    case 5: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EmailDynamo.prototype.getLatestEmail = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var sortedHistory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEmailVersionHistory(name)];
                    case 1:
                        sortedHistory = _a.sent();
                        return [2 /*return*/, sortedHistory[0]];
                }
            });
        });
    };
    EmailDynamo.prototype.getEmailVersionHistory = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var requestParams;
            var _this = this;
            return __generator(this, function (_a) {
                requestParams = {
                    TableName: 'sendable_emails',
                    KeyConditionExpression: '#name_attribute = :name_value',
                    ExpressionAttributeNames: {
                        '#name_attribute': 'name',
                    },
                    ExpressionAttributeValues: {
                        ':name_value': name,
                    },
                    ScanIndexForward: false,
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.documentClient.query(requestParams, function (err, data) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data.Items);
                            }
                        });
                    })];
            });
        });
    };
    EmailDynamo.prototype.emailList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            var _this = this;
            return __generator(this, function (_a) {
                params = {
                    TableName: 'sendable_emails',
                    AttributesToGet: ['name'],
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.documentClient.scan(params, function (err, data) {
                            if (err)
                                reject(err);
                            else {
                                var names_1 = new Set();
                                data.Items.map(function (item) { return names_1.add(item.name); });
                                // @ts-expect-error ts-migrate(2569) FIXME: Type 'Set<unknown>' is not an array type or a stri... Remove this comment to see the full error message
                                resolve(__spreadArray([], names_1));
                            }
                        });
                    })];
            });
        });
    };
    // private
    EmailDynamo.prototype.addEmail = function (name, version, subject, html, plaintext) {
        return __awaiter(this, void 0, void 0, function () {
            var item, putParams;
            var _this = this;
            return __generator(this, function (_a) {
                item = {
                    name: { S: name },
                    version: { N: "" + version },
                    subject: { S: subject },
                    html: { S: html },
                    plaintext: { S: plaintext },
                };
                putParams = {
                    Item: item,
                    TableName: 'sendable_emails',
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.dynamo.putItem(putParams, function (err, data) {
                            if (err) {
                                return reject(data);
                            }
                            else {
                                return resolve(data);
                            }
                        });
                    })];
            });
        });
    };
    return EmailDynamo;
}());
exports.EmailDynamo = EmailDynamo;
exports.default = EmailDynamo;
