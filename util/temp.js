// this file is for keeping an "universal" data object
const { Storage } = require("saltjs");

const store = new Storage();
store.set("cacheGuilds", []);
module.exports = store;
Object.defineProperty(module.exports, "temp", { value: store });
