"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var https = __importStar(require("https"));
var prisma_1 = __importDefault(require("../db/prisma"));
var auth_1 = __importDefault(require("../lib/auth"));
var otp_1 = __importDefault(require("../lib/otp"));
var base64Decode = function (str) { return Buffer.from(str, 'base64').toString('utf-8'); };
var HttpClient = /** @class */ (function () {
    function HttpClient(host, certificate, port) {
        this.host = host;
        this.certificate = certificate;
        this.port = port;
        /*
          Call logIn(actor) to send logged in HTTP calls
        */
        this.actor = null;
        this.session = null;
        this.token = null;
    }
    HttpClient.prototype.post = function (endpoint, data) {
        return __awaiter(this, void 0, void 0, function () {
            var authHeader, options, responseChunks;
            return __generator(this, function (_a) {
                authHeader = this.token ? "Bearer " + base64Decode(this.token) : '';
                options = {
                    host: this.host,
                    port: this.port,
                    path: endpoint,
                    method: 'POST',
                    ca: this.certificate,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: authHeader,
                    },
                };
                responseChunks = [];
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = https.request(options, function (res) {
                            res.on('data', function (d) {
                                responseChunks.push(d);
                            });
                            res.on('end', function () {
                                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Buffer' is not assignable to par... Remove this comment to see the full error message
                                resolve(JSON.parse(Buffer.concat(responseChunks)));
                            });
                            res.on('error', function (e) {
                                reject(e);
                            });
                        });
                        request.write(JSON.stringify(data));
                        request.end();
                    })];
            });
        });
    };
    HttpClient.prototype.forceLogIn = function (actor) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.actor = actor;
                        return [4 /*yield*/, prisma_1.default.session.findFirst({
                                where: {
                                    actorId: this.actor.id,
                                    revokedAt: null,
                                },
                            })];
                    case 1:
                        session = _a.sent();
                        if (!!session) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma_1.default.session.create({
                                data: {
                                    actorId: actor.id,
                                    secret: otp_1.default.generate(),
                                },
                            })];
                    case 2:
                        session = _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.setSession(session)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    HttpClient.prototype.setSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.session = session;
                        _a = this;
                        return [4 /*yield*/, auth_1.default.tokenFromSession(session)];
                    case 1:
                        _a.token = _b.sent();
                        return [2 /*return*/, { session: this.session, token: this.token }];
                }
            });
        });
    };
    return HttpClient;
}());
exports.default = HttpClient;
