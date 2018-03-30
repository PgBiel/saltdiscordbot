import colors from "chalk";
import changeConsole from "./changeConsole";
process.on("unhandledRejection", rejection => {
  console.log(colors.red("[ERR/REJCTUNH]"), rejection);
});
const setShards: { id: number } = { id: null };
changeConsole(false, setShards);
console.log("Initializing...");
import {
  botMessage, checkMutes, loadCmds, messagerDoEval, processMessage, rejctF, checkWarns
} from "./funcs/funcs";
import { bot, data, decodeT, Discord, fs, logger, messager, /* sql, */ Time, toml } from "./util/deps";
import "./misc/events";
setShards.id = bot.shard.id;
import * as cmds from "./commands/cmdIndex";
const { Collection, Message } = Discord;
process.on("message", mdata => {
  processMessage(mdata);
});
bot.on("message", m => {
  botMessage(m);
});
loadCmds();
messager.on("doEval", async edata => {
  messagerDoEval(edata);
});
// sql.sync().catch(rejct);
bot.login(decodeT(data.bot.token_beta)).catch(rejctF("[BOT-LOGIN]"));
setInterval(() => {
  checkMutes();
  checkWarns();
}, Time.seconds(10));
