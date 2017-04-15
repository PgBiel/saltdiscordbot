console.oldLog = console.log;
console.log = function() {
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
  return console.oldLog.apply({}, args);
};
console.oldError = console.error;
console.error = function() {
  const args = Array.from(arguments);
  args.unshift(colors.bgYellow.bold(`[MNG]`) + " ");
  return console.oldError.apply({}, args);
};
const colors = require("chalk");
const cmd = require("commander");
cmd
  .option("-b", "--beta", "Is beta or not")
  .parse(process.argv);
process.chdir(`${process.env.HOME}/Documents/Bot Stuff/${cmd.beta ? "Beta " : ""}Salt`);
const Discord = require("discord.js");
const Manager = new Discord.ShardingManager("./bot.js", {
  totalShards: 2
});

Manager.spawn().then(shards => {
  console.log("Spawned", colors.cyan(shards.size), "shards!");
});
