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
    process.chdir(dir);
  }
  // console.log(dir, inspect(cmd));
}
const Manager = new Discord.ShardingManager("./bot.js", {
  totalShards: 2,
});

Manager.spawn().then(shards => {
  console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
  shards.forEach(shard => {
    shard.on("message", message => {
      console.log(`Received message from shard ${shard.id}`);
      if (message && message.type === "dbUpdate" && message.table && message.statement) {
        console.log("Message is ok");
        Manager.broadcast(message);
      }
    });
  });
});
