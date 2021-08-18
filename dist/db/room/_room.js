"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __importDefault(require("./core"));
var data_1 = __importDefault(require("./data"));
var memberships_1 = __importDefault(require("./memberships"));
var names_and_routes_1 = __importDefault(require("./names_and_routes"));
var permissions_1 = __importDefault(require("./permissions"));
var templates_1 = __importDefault(require("./templates"));
exports.default = {
    memberships: memberships_1.default,
    permissions: permissions_1.default,
    namesAndRoutes: names_and_routes_1.default,
    data: data_1.default,
    core: core_1.default,
    templates: templates_1.default,
};
