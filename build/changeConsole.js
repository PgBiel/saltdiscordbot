"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
function editConsole(isMng, shardIDObj) {
    if (!console.log.__wasChanged) {
        console.oldLog = console.log;
        console.log = function () {
            const args = Array.from(arguments);
            args.unshift(colors.bgYellow.bold(isMng ? `[MNG]` : `[S${shardIDObj.id == null ? "?" : shardIDObj.id}]`) + " ");
            return console.oldLog.apply({}, args);
        };
        Object.defineProperty(console.log, "__wasChanged", { value: true });
    }
    if (!console.error.__wasChanged) {
        console.oldError = console.error;
        console.error = function () {
            const args = Array.from(arguments);
            args.unshift(colors.bgYellow.bold(isMng ? `[MNG]` : `[S${shardIDObj.id == null ? "?" : shardIDObj.id}]`) + " ");
            return console.oldError.apply({}, args);
        };
        Object.defineProperty(console.error, "__wasChanged", { value: true });
    }
}
exports.default = editConsole;
