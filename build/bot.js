"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
const changeConsole_1 = require("./changeConsole");
process.on("unhandledRejection", (rejection) => {
    console.log(colors.red("[ERR/REJCTUNH]"), rejection);
});
const setShards = { id: null };
changeConsole_1.default(false, setShards);
console.log("Initializing...");
require("./misc/events");
const deps_1 = require("./util/deps");
setShards.id = deps_1.bot.shard.id;
const funcs_1 = require("./util/funcs");
const { Collection, Message } = deps_1.Discord;
process.on("message", (mdata) => {
    funcs_1.processMessage(mdata);
});
deps_1.bot.on("message", (m) => {
    funcs_1.botMessage(m);
});
funcs_1.loadCmds();
deps_1.messager.on("doEval", (edata) => {
    funcs_1.messagerDoEval((thing) => eval(thing))(edata); // tslint:disable-line:no-eval
});
// sql.sync().catch(rejct);
deps_1.bot.login(deps_1.decodeT(deps_1.data.bot.token_beta)).catch(funcs_1.rejct);
setInterval(funcs_1.checkMutes, deps_1.Time.seconds(10));
