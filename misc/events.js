const { bot, colors } = require("../util/deps");
const { djsDebug, djsWarn } = require("../util/funcs");

bot.on("ready", () => {
  console.log(colors.green(`Shard ${bot.shard.id} initialized!`));
});
bot.on("debug", info => {
  djsDebug(info);
});
bot.on("warn", info => {
  djsWarn(info);
});
