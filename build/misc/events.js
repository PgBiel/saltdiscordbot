"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
deps_1.bot.on("ready", () => {
    console.log(deps_1.colors.green(`Shard ${deps_1.bot.shard.id} initialized!`));
});
deps_1.bot.on("debug", (info) => {
    funcs_1.djsDebug(info);
});
deps_1.bot.on("warn", (info) => {
    funcs_1.djsWarn(info);
});
