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
var _this = this;
var spawn = require('child_process').spawn;
//const cache = require('./lib/cache');
var _a = require('./lib/utils'), timeout = _a.timeout, orderServer = _a.orderServer;
var queryString = require('query-string');
var APP = process.env.USERS ? true : false;
var factor = Number(process.env.FACTOR) || 1;
var proxy = '34.228.239.238';
var processes = [];
var init = function () { return __awaiter(_this, void 0, void 0, function () {
    var i, query, ffmpeg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < factor)) return [3 /*break*/, 4];
                query = '';
                if (APP) {
                    //query = '?' + queryString.stringify(users[i]);
                }
                query = '?youtube=2ezw-r40m-uwk1-bzvg-4mc3'; //
                console.log('QUERY: ', query);
                ffmpeg = spawn('ffmpeg', [
                    '-re',
                    '-stream_loop',
                    '-1',
                    '-i',
                    'input.mp4',
                    '-c',
                    'copy',
                    '-f',
                    'flv',
                    "rtmp://" + proxy + ":1935/stream/key" + i + query //${pos}-${i}${query}`
                ]);
                ffmpeg.stdout.on('data', function (data) {
                    console.log("stdout: " + data);
                });
                ffmpeg.stderr.on('data', function (data) {
                    console.error("stderr: " + data);
                });
                ffmpeg.on('close', function (code) {
                    console.log("child process exited with code " + code);
                });
                processes.push(ffmpeg);
                return [4 /*yield*/, timeout(500)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
init();
