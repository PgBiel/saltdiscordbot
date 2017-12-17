// this file is for keeping an "universal" data object
const { Storage } = require("saltjs");

module.exports = new Storage();
Object.defineProperty(module.exports, "temp", { value: module.exports });
