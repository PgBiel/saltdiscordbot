const colors = require("chalk");
const changeConsole = require("./changeConsole");
process.on("unhandledRejection", rejection => {
  console.log(colors.red("[ERR/REJCTUNH]"), rejection);
});
const setShards = { id: null };
changeConsole(false, setShards);
console.log("Initializing...");
require("./misc/events");
const { bot, data, decodeT, Discord, fs, logger, messager, /* sql, */ Time, toml } = require("./util/deps");
setShards.id = bot.shard.id;
const {
  botMessage, checkMutes, IMessagerEvalData, loadCmds, messagerDoEval, processMessage, rejct,
} = require("./util/funcs");
const { Collection, Message } = Discord;
process.on("message", mdata => {
  processMessage(mdata);
});
bot.on("message", m => {
  botMessage(m);
});
loadCmds();
messager.on("doEval", edata => {
  messagerDoEval(thing => eval(thing))(edata);
});
// sql.sync().catch(rejct);
bot.login(decodeT(data.bot.token_beta)).catch(rejct);
setInterval(checkMutes, Time.seconds(10));
