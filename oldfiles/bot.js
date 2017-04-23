console.oldLog = console.log;
console.log = function() {
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[S${bot.shard.id === 0 ? "0" : bot.shard.id || "?"}]`) + " ");
  return console.oldLog.apply({}, args);
};
console.oldError = console.error;
console.error = function() {
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[S${bot.shard.id === 0 ? "0" : bot.shard.id || "?"}]`) + " ");
  return console.oldError.apply({}, args);
};
require("./misc/globals.js");
global.messager = require("./misc/messager.js");
Object.assign(global, require("./sequelize/sequelize.js"));
const data = toml.parse(fs.readFileSync("./data.toml", "utf8"));
const {Collection} = Discord;
require("./misc/events.js");
process.on("message", data=>{
  funcs.processMessage(data);
});
bot.on("message", m => {
  funcs.botMessage(m);
});
bot.commands = {};
funcs.loadCmds();
messager.on("doEval", data=>{
  funcs.messagerDoEval(data);
});
sql.sync().catch(rejct);
bot.login(decodeT(/Beta/.test(process.cwd()) ? data.bot.token_beta : data.bot.token)).catch(rejct);