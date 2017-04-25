"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
console.oldLog = console.log;
console.log = function () {
    const args = Array.from(arguments);
    args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
    return console.oldLog.apply({}, args);
};
console.oldError = console.error;
console.error = function () {
    const args = Array.from(arguments);
    args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
    return console.oldError.apply({}, args);
};
