import "./changeConsole";
import "./misc/events";
import { bot, data, decodeT, Discord, fs, messager, sql, toml } from "./util/deps";
import { botMessage, IMessagerEvalData, loadCmds, messagerDoEval, processMessage, rejct } from "./util/funcs";
// Object.assign(global, require("./sequelize/sequelize.js"));
const { Collection, Message } = Discord;
process.on("message", (mdata: any) => {
  processMessage(mdata);
});
bot.on("message", (m: any) => {
  botMessage(m);
});
loadCmds();
messager.on("doEval", (edata: IMessagerEvalData) => {
  messagerDoEval((thing) => eval(thing))(edata); // tslint:disable-line:no-eval
});
sql.sync().catch(rejct);
bot.login(decodeT(/Beta/.test(process.cwd()) ? data.bot.token_beta : data.bot.token)).catch(rejct);
