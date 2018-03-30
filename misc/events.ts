import { bot, colors } from "../util/deps";
import { djsDebug, djsWarn } from "../funcs/funcs";

bot.on("ready", () => {
  console.log(colors.green(`Shard ${bot.shard.id} initialized!`));
});
bot.on("debug", info => {
  djsDebug(info);
});
bot.on("warn", info => {
  djsWarn(info);
});
