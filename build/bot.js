"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./changeConsole");
require("./misc/events");
const deps_1 = require("./util/deps");
const funcs_1 = require("./util/funcs");
// Object.assign(global, require("./sequelize/sequelize.js"));
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
deps_1.sql.sync().catch(funcs_1.rejct);
deps_1.bot.login(deps_1.decodeT(/Beta/.test(process.cwd()) ? deps_1.data.bot.token_beta : deps_1.data.bot.token)).catch(funcs_1.rejct);
