import * as colors from "chalk";
import changeConsole from "./changeConsole";
process.on("unhandledRejection", (rejection: any) => {
  console.log(colors.red("[ERR/REJCTUNH]"), rejection);
});
const setShards = { id: null };
changeConsole(false, setShards);
console.log("Initializing...");
import "./misc/events";
import { bot, data, decodeT, Discord, fs, logger, messager, sql, toml } from "./util/deps";
setShards.id = bot.shard.id;
import { botMessage, IMessagerEvalData, loadCmds, messagerDoEval, processMessage, rejct } from "./util/funcs";
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
bot.login(decodeT(data.bot.token_beta)).catch(rejct);
