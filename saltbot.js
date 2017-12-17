const colors = require("chalk");
const cmd = require("commander");
const Discord = require("discord.js");
const { inspect } = require("util");
const changeConsole = require("./changeConsole");
changeConsole(true);
cmd
  .option("-d, --default", "Use current directory")
  .option("-b, --beta", "Is beta or not")
  .option("-g, --github", "Use github directory")
  .parse(process.argv);
if (!cmd.default) {
  let dir;
  if (cmd.github || cmd.beta) {
    dir = process.env.HOME + "/";
    if (cmd.github) {
      dir += "Github/saltdiscordbot";
    } else {
      dir += `Documents/Bot Stuff/${cmd.beta ? "Beta " : ""}Salt`;
    }
  } else {
    dir = ".";
  }
  // console.log(dir, inspect(cmd));
  process.chdir(dir);
}
const Manager = new Discord.ShardingManager("./bot.js", {
  totalShards: 2,
});

Manager.spawn().then(shards => {
  console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
  Manager.on("message", message => {
    if (message && message.type === "dbUpdate" && message.table && message.statement) {
      Manager.broadcast(message);
    }
  });
});
