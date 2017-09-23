import * as colors from "chalk";
import * as cmd from "commander";
import * as Discord from "discord.js";
import { inspect } from "util";
import changeConsole from "./changeConsole";
changeConsole(true);
cmd
  .option("-b, --beta", "Is beta or not")
  .option("-g, --github", "Use github directory")
  .parse(process.argv);
const dir = `${process.env.HOME}/${cmd.github ?
    "GitHub/saltdiscordbot" :
    `Documents/Bot Stuff/${cmd.beta ?
      "Beta " :
      ""}Salt`}/build`;
// console.log(dir, inspect(cmd));
process.chdir(dir);
const Manager = new Discord.ShardingManager("./bot.js", {
  totalShards: 2,
});

Manager.spawn().then((shards: Discord.Collection<number, Discord.Shard>) => {
  console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
  Manager.on("message", (message: any) => {
    if (message && message.type === "dbUpdate" && message.table && message.statement) {
      Manager.broadcast(message);
    }
  });
});
