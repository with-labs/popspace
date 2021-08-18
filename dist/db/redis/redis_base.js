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
var redis_1 = __importDefault(require("redis"));
var RedisBase = /** @class */ (function () {
    function RedisBase(credentials) {
        this.client = redis_1.default.createClient(credentials);
        this.client.on('ready', function () {
            /*
              TODO: right now, this serendipitously works,
              since by the time this line is reached,
              all of our downstream repos dependent on redis
              will already have logging initialized in this style.
      
              But we should move towards a longer-term solution. Ideas:
              - log is defined in shared
                - downstream apps need to control the directory of logging
                - but perhaps if it defaults to being in the repos `./logs` it's fine
                - there needs to be a capacity to add more log outputs
                - the problem is log4js takes a config with outputs up front,
                  so we gotta figure out how to best handle the config/init handshake
              - log is stubbed in shared
                - if no log is defined, we can define logging via console.log
                - the problem is where to define it
                - log is now global in downstream repos
                - but shared shouldn't reference globals other than shared
                - we could do shared.log, and declare log as a synonym downstream
            */
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
            log.app.info('Redis is ready');
        });
        this.client.on('error', function (error) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
            log.error.error('Error initializing redis', error);
        });
    }
    RedisBase.prototype.enqueue = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        /*
                          Push on the left so it's easier to peek -
                          peeking is looking at the 0th element this way,
                          vs having to figure out the length/size in the off-case.
                        */
                        _this.client.lpush(key, data, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.dequeue = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.rpop(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    /*
      This queue is not 100% accurate.
  
      The queue order is based on server timestamp, which is inaccurate in general.
  
      It's possible to make a slow, guaranteed-order queue,
      if we stored an index in a redis value, and incremented it each insert,
      and used it for the zset score.
    */
    RedisBase.prototype.enqueueUnique = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.zadd(key, Date.now(), value)];
            });
        });
    };
    RedisBase.prototype.dequeueUnique = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zpopmin(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    /*
      This will dequeue a value and atomically write it
      to an indermediate store.
  
      This is useful, for example, for processing elements
      in a redis queue. If the processing process dies
      after an element is dequeued, and before it is processed -
      it is lost forever.
  
      If we store it in the intermediate stash, we have a chance of
      recovering, and processing it.
  
      We'd still want to figure out if it was indeed successfully processed,
      but after that the intermediate store was not cleared.
  
      returns the dequeued value
    */
    RedisBase.prototype.carefulDequeueUnique = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.moveAndFetch(key, this.intermediateStoreKey(key))];
            });
        });
    };
    RedisBase.prototype.finishCarefulDequeue = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.moveAndFetch(this.intermediateStoreKey(key), this.finishedStoreKey(key), value)];
            });
        });
    };
    RedisBase.prototype.moveAndFetch = function (fromKey, toKey, value) {
        if (value === void 0) { value = null; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.watch(fromKey, function (watchError) { return __awaiter(_this, void 0, void 0, function () {
                            var score;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (watchError) {
                                            throw watchError;
                                        }
                                        if (!(value == null)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.zpeek(fromKey)];
                                    case 1:
                                        value = _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        if (!value) {
                                            throw 'Empty zset';
                                        }
                                        return [4 /*yield*/, this.zscore(fromKey, value)];
                                    case 3:
                                        score = _a.sent();
                                        /*
                                          atomically moves the next value from the
                                          zset to the intermediate store.
                                        */
                                        this.client
                                            .multi()
                                            .zrem(fromKey, value)
                                            .zadd(toKey, score, value)
                                            .exec(function (error, result) {
                                            if (error) {
                                                reject(error);
                                            }
                                            else {
                                                resolve(value);
                                            }
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    /*
      Shows the element with the greatest score,
      w/o popping it.
    */
    RedisBase.prototype.zpeek = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zrange(key, 0, 0, function (err, result) {
                            if (err)
                                return reject(err);
                            else
                                return resolve(result[0]);
                        });
                    })];
            });
        });
    };
    /*
      Returns cardinality/total number of members
    */
    RedisBase.prototype.zcard = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zcard(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    /*
      Returns score of one element in zset
    */
    RedisBase.prototype.zscore = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zscore(key, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.zmembers = function (key, withScores) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (withScores) {
                            _this.client.zrange(key, 0, -1, 'withscores', function (err, result) {
                                if (err)
                                    return reject(err);
                                else
                                    return resolve(result);
                            });
                        }
                        else {
                            _this.client.zrange(key, 0, -1, _this.onComplete(resolve, reject));
                        }
                    })];
            });
        });
    };
    RedisBase.prototype.zcount = function (key, min, max) {
        if (min === void 0) { min = '-inf'; }
        if (max === void 0) { max = 'inf'; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zcount(key, min, max, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.zadd = function (key, score, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zadd(key, score, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.zrem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zrem(key, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.zismember = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.zscore(key, value, function (err, result) {
                            if (err)
                                return reject(err);
                            else
                                return resolve(result);
                        });
                    })];
            });
        });
    };
    RedisBase.prototype.hset = function (key, hKey, hValue) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.hset(key, hKey, hValue, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.hget = function (key, hKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.hget(key, hKey, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.hdel = function (key, hKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.hdel(key, hKey, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.del = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.del(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.sadd = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.sadd(key, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.srem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.srem(key, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.spop = function (key, count) {
        if (count === void 0) { count = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.spop(key, count, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.smembers = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.smembers(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.set(key, value, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    RedisBase.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.client.get(key, _this.onComplete(resolve, reject));
                    })];
            });
        });
    };
    // private
    RedisBase.prototype.onComplete = function (resolve, reject) {
        return function (err, result) {
            if (err)
                return reject(err);
            else
                return resolve(result);
        };
    };
    RedisBase.prototype.intermediateStoreKey = function (key) {
        return key + "__dequeued___";
    };
    RedisBase.prototype.finishedStoreKey = function (key) {
        return key + "__finished___";
    };
    return RedisBase;
}());
exports.default = RedisBase;
