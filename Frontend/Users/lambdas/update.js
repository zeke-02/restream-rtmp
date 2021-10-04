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
exports.__esModule = true;
exports.handler = void 0;
var _ = require("lodash");
//import { Client } from 'pg';
var sequelize_1 = require("sequelize");
var handler = function (event, _context) { return __awaiter(void 0, void 0, void 0, function () {
    var body, UUID, wsequelize, wUser, result_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(event);
                body = JSON.parse(event.body);
                console.log(event);
                UUID = body.UUID;
                if (!UUID) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: "missing UUID"
                        }];
                }
                wsequelize = new sequelize_1.Sequelize('Users', process.env.Username, process.env.Password, {
                    host: process.env.WriterEndpoint,
                    port: Number(process.env.Port),
                    dialect: 'postgres',
                    pool: {
                        max: 1,
                        idle: 1000
                    }
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, wsequelize.authenticate()];
            case 2:
                _a.sent();
                console.log('Connection has been established successfully to the reader endpoint.');
                return [4 /*yield*/, wsequelize.define('Users', {
                        UUID: {
                            type: sequelize_1.DataTypes.UUID,
                            primaryKey: true,
                            allowNull: false
                        },
                        youtube_key: {
                            type: sequelize_1.DataTypes.STRING
                        },
                        facebook_key: {
                            type: sequelize_1.DataTypes.STRING
                        },
                        twitch_key: {
                            type: sequelize_1.DataTypes.STRING
                        },
                        key: {
                            type: sequelize_1.DataTypes.STRING
                        },
                        preferences: {
                            type: sequelize_1.DataTypes.JSON
                        }
                    })];
            case 3:
                wUser = _a.sent();
                return [4 /*yield*/, wUser.findByPk(UUID)];
            case 4:
                result_1 = _a.sent();
                console.log(result_1);
                if (!!result_1) return [3 /*break*/, 5];
                return [2 /*return*/, {
                        statusCode: 200,
                        body: null
                    }];
            case 5:
                //body: {youtube_key: ..., facebook_key: ...}
                _.forEach(body, function (value, key) {
                    result_1[key] = value;
                });
                return [4 /*yield*/, result_1.save()];
            case 6:
                _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify(result_1),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({
                            error: 'There was an error retrieving the user'
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
