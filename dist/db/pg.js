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
exports.Pg = void 0;
var async_lock_1 = __importDefault(require("async-lock"));
var massive_1 = __importDefault(require("massive"));
var pg_1 = __importDefault(require("pg"));
var pg_monitor_1 = __importDefault(require("pg-monitor"));
/*
  Class for managing sessions with postgres.

  If we have replica-choosing logic, this is the logical place to put it.
*/
var lock = new async_lock_1.default();
/*
  Massive relies on setImmediate wtf.
  https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
  It's not standard js; when I run tests in noodle-api,
  it works, but in hermes I get an error that setImmediate isn't defined.

  They do have it in Node... so I don't understand why it
  works in one repo and not another.
  https://nodejs.dev/learn/understanding-setimmediate

  We can always pull in a proper polyfill
  https://www.npmjs.com/package/setimmediate

  But seems like there should be a better solution if it works
  in noodle-api - and used to work previously in mercury and others.
*/
// @ts-expect-error ts-migrate(2322) FIXME: Type '(((callback: (...args: any[]) => void, ...ar... Remove this comment to see the full error message
global.setImmediate =
    global.setImmediate ||
        (function (x) {
            // https://stackoverflow.com/questions/15349733/setimmediate-vs-nexttick/15349865#15349865
            return process.nextTick(x);
        });
if (!global.log) {
    // Perhaps the shared repo can have a standard log defined at the top level
    global.log = {
        app: {
            debug: function (message) { return console.log(message); },
            info: function (message) { return console.log(message); },
            warn: function (message) { return console.log(message); },
            error: function (message) { return console.log(message); },
        },
    };
}
var overridePgTimestampConversion = function () {
    // node-postgres, which is what massivejs is based on,
    // performs time zone conversion.
    // this screws everything up if you store dates in UTC
    // what we want is to return the raw date.
    var timestampOID = 1114;
    pg_1.default.setTypeParser(1114, function (stringValue) {
        return stringValue;
    });
};
var __db = null;
var Pg = /** @class */ (function () {
    function Pg() {
    }
    Pg.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, lock.acquire('with_init_pg', function () { return __awaiter(_this, void 0, void 0, function () {
                            var config;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (__db) {
                                            this.massive = __db;
                                            return [2 /*return*/, __db];
                                        }
                                        overridePgTimestampConversion();
                                        config = require('./config');
                                        return [4 /*yield*/, massive_1.default(config)];
                                    case 1:
                                        __db = _a.sent();
                                        this.massive = __db;
                                        try {
                                            pg_monitor_1.default.attach(__db.driverConfig);
                                            pg_monitor_1.default.setTheme('matrix');
                                        }
                                        catch (e) {
                                            // With lambdas it seems sometimes the monitor fails to detach between runs
                                            // keep logs to understand frequency
                                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                            log.app.warn('monitor.attach failed, rertying', e);
                                            try {
                                                pg_monitor_1.default.detach();
                                                pg_monitor_1.default.attach(__db.driverConfig);
                                                pg_monitor_1.default.setTheme('matrix');
                                                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                                log.app.warn('Having to detach and re-attach monitor');
                                            }
                                            catch (weirdException) {
                                                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                                log.app.warn('Failed to attach monitor', weirdException);
                                            }
                                        }
                                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                        log.app.debug('Initialized postgres');
                                        return [2 /*return*/, __db];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, __db];
                }
            });
        });
    };
    Pg.prototype.tearDown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, lock.acquire('with_teardown_pg', function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!__db) return [3 /*break*/, 5];
                                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                        log.app.info('Acquired tear down lock');
                                        try {
                                            pg_monitor_1.default.detach();
                                        }
                                        catch (e) {
                                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                            log.app.warn('Detaching unattached monitor');
                                            // Nothing to do...
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, __db.instance.$pool.end()];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_1 = _a.sent();
                                        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                                        log.app.warn('Ending pool multiple times');
                                        return [3 /*break*/, 4];
                                    case 4:
                                        __db = null;
                                        this.massive = null;
                                        _a.label = 5;
                                    case 5: return [2 /*return*/, true];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Pg.prototype.silenceLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                pg_monitor_1.default.detach();
                return [2 /*return*/];
            });
        });
    };
    return Pg;
}());
exports.Pg = Pg;
exports.default = new Pg();
