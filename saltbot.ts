import * as colors from "chalk";
import * as cmd from "commander";
import * as Discord from "discord.js";
import "./changeConsole";
cmd
  .option("-b", "--beta", "Is beta or not")
  .parse(process.argv);
process.chdir(`${process.env.HOME}/Documents/Bot Stuff/${cmd.beta ? "Beta " : ""}Salt/build`);
const Manager = new Discord.ShardingManager("./bot.js", {
  totalShards: 2,
});

Manager.spawn().then((shards: Discord.Collection<number, Discord.Shard>) => {
  console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
});
