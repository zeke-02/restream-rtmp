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
var redis = require('redis');
var promisify = require("util").promisify;
var _ = require("lodash");
///const client = redis.createClient({ host: 'video-streaming-redis.2qoi21.ng.0001.use1.cache.amazonaws.com' });
//const getAsync = promisify(client.get).bind(client);
// const hset = promisify(client.hset).bind(client);
// const hvals = promisify(client.hvals).bind(client);
var promises_1 = require("fs/promises");
var retrieveUsers = function (start, end) { return __awaiter(void 0, void 0, void 0, function () {
    var a, i;
    return __generator(this, function (_a) {
        a = [];
        for (i = start; i <= end; i++) {
            //const resp = await hvals(`user:${i}`);
            //a.push({email: resp[0], youtube: resp[1], twitch: resp[2]});
        }
        return [2 /*return*/, a];
    });
}); };
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var buf, decoder, data, array, toRedis, writeData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, promises_1.readFile("./data.txt")];
            case 1:
                buf = _a.sent();
                decoder = new TextDecoder();
                data = decoder.decode(buf);
                array = _.split(data, '\n');
                _.forEach(array, function (elem, i, arr) {
                    arr[i] = _.trimEnd(elem, '\r');
                });
                toRedis = [];
                _.forEach(array, function (elem, index) {
                    var arr = _.split(elem, '\t');
                    toRedis[index] = [arr[0], arr[1], arr[2], arr[3]];
                });
                writeData = '';
                _.forEach(toRedis, function (elem, index) {
                    writeData += '\n[' + (" '" + elem[0] + "', '" + elem[1] + "', '" + elem[2] + "', '" + elem[3] + "' ],") + '\n';
                });
                console.log(writeData);
                return [2 /*return*/];
        }
    });
}); };
init();
// retrieveUsers(0,1).then(arr=> {
//     console.log(arr);
// });
