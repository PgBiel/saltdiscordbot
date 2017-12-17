import { bot, colors } from "../util/deps";
import { djsDebug, djsWarn } from "../util/funcs";

bot.on("ready", () => {
  console.log(colors.green(`Shard ${bot.shard.id} initialized!`));
});
bot.on("debug", (info: string) => {
  djsDebug(info);
});
bot.on("warn", (info: string) => {
  djsWarn(info);
});
