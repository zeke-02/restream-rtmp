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
var axios = require('axios')["default"];
var sequelize_1 = require("sequelize");
var client_lambda_1 = require("@aws-sdk/client-lambda");
var handler = function (event, _context) { return __awaiter(void 0, void 0, void 0, function () {
    var body, UUID, youtube_key, twitch_key, facebook_key, preferences, paramsStats, lResponse, json, payload, key, wsequelize, wUser, queryInterface, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = JSON.parse(event.body);
                console.log(event);
                UUID = body.UUID;
                youtube_key = body.youtube_key ? body.youtube_key : '';
                twitch_key = body.twitch_key ? body.twitch_key : '';
                facebook_key = body.facebook_key ? body.facebook_key : '';
                preferences = JSON.stringify(body.preferences) ? JSON.stringify(body.preferences) : JSON.stringify({
                    youtube: false,
                    facebook: false,
                    twitch: false
                });
                paramsStats = {
                    FunctionName: 'users-dev-getKey',
                    LogType: 'Tail'
                };
                return [4 /*yield*/, invoke(paramsStats)];
            case 1:
                lResponse = _a.sent();
                json = decodeUtf8(lResponse);
                console.log(json);
                payload = JSON.parse(json);
                console.log(payload);
                key = event.body.key ? event.body.key : payload.key;
                wsequelize = new sequelize_1.Sequelize('Users', process.env.Username, process.env.Password, {
                    host: process.env.WriterEndpoint,
                    port: Number(process.env.Port),
                    dialect: 'postgres',
                    pool: {
                        max: 1,
                        idle: 1000
                    }
                });
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                return [4 /*yield*/, wsequelize.authenticate()];
            case 3:
                _a.sent();
                console.log('Connection has been established successfully to the writer endpoint.');
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
            case 4:
                wUser = _a.sent();
                queryInterface = wsequelize.getQueryInterface();
                return [4 /*yield*/, wUser.sync()];
            case 5:
                _a.sent();
                user = wUser.build({
                    UUID: UUID,
                    youtube_key: youtube_key,
                    facebook_key: facebook_key,
                    twitch_key: twitch_key,
                    preferences: preferences,
                    key: key
                });
                return [4 /*yield*/, user.save()];
            case 6:
                _a.sent();
                console.log(user);
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify(user)
                    }];
            case 7:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({
                            error: 'There was an error creating the user'
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
function decodeUtf8(bytes) {
    var encoded = "";
    for (var i = 0; i < bytes.length; i++) {
        encoded += '%' + bytes[i].toString(16);
    }
    return decodeURIComponent(encoded);
}
var client = new client_lambda_1.LambdaClient({ region: 'us-east-1' });
var invoke = function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var command, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                command = new client_lambda_1.InvokeCommand(params);
                return [4 /*yield*/, client.send(command)];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response.Payload];
        }
    });
}); };
