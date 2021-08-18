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
exports.NamesAndRoutes = void 0;
var crypto_random_string_1 = __importDefault(require("crypto-random-string"));
var args_1 = __importDefault(require("../../lib/args"));
var prisma_1 = __importDefault(require("../prisma"));
var LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
var NUMBERS = '0123456789';
var LOWERCASE_AND_NUMBERS = LOWERCASE + NUMBERS;
/*
There are several "names" of a room:
1.) Its route
2.) Its display name
3.) Its URL name
4.) Its URL identifier

The route of a room always looks like "/room-url-name-url_id_12345"
The url name is derived from the display name - converting spaces to dashes,
lowercasing, removing special characters...

When the room is renamed, the route changes - though old routes remain valid.

A room is only really matched by its url ID - a user-facing static
identifier for the room.

It's distinct from the indexing identifier which is used to query rooms.
URL IDs don't reveal information about how many rooms we have,
are harder to brute force, and re-oxygenate the internet at night.
*/
var NamesAndRoutes = /** @class */ (function () {
    function NamesAndRoutes() {
    }
    NamesAndRoutes.prototype.roomToRoute = function (room) {
        return this.route(room.displayName, room.urlId);
    };
    /*
      A route always looks like "/room-url-name-url_id_12345"
  
      The room-url-name is derived from displayName
      urlRoomId is a unique user-facing static identifier of the room,
    */
    NamesAndRoutes.prototype.route = function (displayName, urlRoomId) {
        /*
          For am empty urlName, stil add a prefix. Currently
          more an artifact of the data model, we can't have
          routes be identical to urlRoomIds.
    
          If we extract urlRoomIds to their own data store,
          we can have empty-named routes with just Ids.
        */
        var urlName = this.getUrlName(displayName);
        if (urlName.length > 0) {
            return urlName + "-" + urlRoomId;
        }
        else {
            return "room-" + urlRoomId;
        }
    };
    NamesAndRoutes.prototype.urlIdFromRoute = function (route) {
        /*
          If a route is like display-name-hey-id12345,
          we can get the last element after a dash.
        */
        return route.split('-').pop();
    };
    NamesAndRoutes.prototype.generateUniqueRoomUrlId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var idString, isUnique, iterations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idString = this.generateRoomId();
                        return [4 /*yield*/, this.isUniqueIdString(idString)];
                    case 1:
                        isUnique = _a.sent();
                        iterations = 0;
                        _a.label = 2;
                    case 2:
                        if (!!isUnique) return [3 /*break*/, 4];
                        idString = this.generateRoomId();
                        return [4 /*yield*/, this.isUniqueIdString(idString)];
                    case 3:
                        isUnique = _a.sent();
                        iterations++;
                        if (iterations == 101) {
                            // FIXME: don't rely on some global 'log' variable which may not exist
                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                            log.error.warn('Over 100 iterations genereating unique room ID...');
                        }
                        if (iterations == 1001) {
                            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'log'.
                            log.error.error('Over 1000 iterations genereating unique room ID...');
                        }
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, idString];
                }
            });
        });
    };
    NamesAndRoutes.prototype.getNormalizedDisplayName = function (displayName) {
        return args_1.default.multiSpaceToSingleSpace(displayName.trim());
    };
    /*
      A URL name is a version of a display name that is
      lowercased, trimmed, has spaced converted to dashes
      and special characters removed
    */
    NamesAndRoutes.prototype.getUrlName = function (displayName) {
        var normalized = this.getNormalizedDisplayName(displayName).toLowerCase();
        // Don't need to replace the A-Z range since we're already normalized.
        // Also we're allowing dashes so that names that look like our routes
        // remain stable, e.g. "room-123" -> "room-123", not "room123"
        var noSpecialCharacters = normalized.replace(/[^a-z0-9 -]/g, '');
        var spacesAsDashes = noSpecialCharacters.trim().replace(/ /g, '-');
        // Clean up double-dashes AFTER spaces have been replaced with dashes
        var noDoubleDashes = args_1.default.multiDashToSingleDash(spacesAsDashes);
        return noDoubleDashes;
    };
    // Private
    NamesAndRoutes.prototype.generateRoomId = function () {
        /*
          Generates an ID using a schema of characters and digits.
    
          Schemas are encoded as strings; c stands for "character or number", d stands for "digit".
    
          We'll care to know what the chance of generating an ID that already exists.
    
          For example,
            dccdccd.
          How many unique IDs?
    
          D * N * N * D * N * N * D = D ^ 3 * N ^ 4
    
          Where N is number of characters, D - digits.
    
          So for 10 digits, 26 characters:
    
          10^3 * 26^4 = 2.6^4 * 10^4 ~ 45 * 10^4 = 4.5 * 10^5
    
          Let's allow c be digit or character
    
          10 ^ 3 * 36 ^ 4 = 1.67 * 10^7
    
          Suppose we want a 0.1% collision rate, i.e. 1/1000th previously seen.
          After which point do various schemas start having worse than 0.1% collisios?
    
          10^5/ 10^3 = 100 names
          10^7/ 10^3 = 10000 names
          ideally we'd want more like 100000 names
        */
        // If we have 24 digits, we have 10^24 names, so 1/1000 collision up to 10^21 names
        // should be enough!
        var length = 24;
        var schema = 'c';
        while (schema.length < length) {
            schema += Math.random() < 0.5 ? 'c' : 'd';
        }
        return this.roomIdFromSchema(schema);
    };
    NamesAndRoutes.prototype.roomIdFromSchema = function (schema) {
        var result = '';
        for (var _i = 0, schema_1 = schema; _i < schema_1.length; _i++) {
            var char = schema_1[_i];
            switch (char) {
                case 'c':
                    result += crypto_random_string_1.default({ length: 1, characters: LOWERCASE });
                    break;
                case 'd':
                    result += crypto_random_string_1.default({ length: 1, characters: NUMBERS });
                    break;
                case 'a':
                    result += crypto_random_string_1.default({
                        length: 1,
                        characters: LOWERCASE_AND_NUMBERS,
                    });
                    break;
            }
        }
        return result;
    };
    NamesAndRoutes.prototype.isUniqueIdString = function (idString) {
        return __awaiter(this, void 0, void 0, function () {
            var existingEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.room.findUnique({
                            where: { urlId: idString },
                        })];
                    case 1:
                        existingEntry = _a.sent();
                        return [2 /*return*/, !existingEntry];
                }
            });
        });
    };
    return NamesAndRoutes;
}());
exports.NamesAndRoutes = NamesAndRoutes;
exports.default = new NamesAndRoutes();
