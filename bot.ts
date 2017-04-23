import "./changeConsole";
import "./misc/events";
import { bot, decodeT, Discord, fs, messager, toml } from "./util/deps";
import { botMessage, IMessagerEvalData, loadCmds, messagerDoEval, processMessage, rejct } from "./util/funcs";
// Object.assign(global, require("./sequelize/sequelize.js"));
const data = toml.parse(fs.readFileSync("./data.toml", "utf8"));
const { Collection, Message } = Discord;
process.on("message", (mdata: any) => {
  processMessage(mdata);
});
bot.on("message", (m: any) => {
  botMessage(m);
});
loadCmds();
messager.on("doEval", (edata: IMessagerEvalData) => {
  messagerDoEval(data);
});
sql.sync().catch(rejct);
bot.login(decodeT(/Beta/.test(process.cwd()) ? data.bot.token_beta : data.bot.token)).catch(rejct);
