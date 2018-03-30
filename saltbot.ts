import colors from "chalk";
import * as cmd from "commander";
import { ShardingManager } from "discord.js";
import { inspect } from "util";
import changeConsole from "./changeConsole";

changeConsole(true);

cmd
  .option("-d, --default", "Use current directory")
  .option("-p, --path [path]", "Use the [path] path", "")
  .option("-b, --beta", "Is beta or not")
  .option("-g, --github", "Use github directory")
  .parse(process.argv);
if (!cmd.default) {
  let dir: string = "";
  if (cmd.github || cmd.beta) {
    dir = process.env.HOME + "/";
    if (cmd.github) {
      dir += "Github/saltdiscordbot";
    } else {
      dir += `Documents/Bot Stuff/${cmd.beta ? "Beta " : ""}Salt`;
    }
    process.chdir(dir);
  } else if (cmd.path) {
    process.chdir(cmd.path);
  }
  // console.log(dir, inspect(cmd));
}
const Manager = new ShardingManager("./bot.js", {
  totalShards: 2
});

Manager.spawn().then(shards => {
  console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
  shards.forEach(shard => {
    shard.on("message", message => { // listen to messages from each shard
      console.log(`Received message from shard ${shard.id}`);
      if (message) {
        if (message.type === "dbUpdate" && message.table && message.statement) {
          console.log("Message is DB");
          Manager.broadcast(message);
        } else if (message.shard != null && message.resID && ["coll", "resColl"].includes(message.type)) {
          Manager.broadcast(Object.assign({}, message, { shardCount: shards.size }));
        }
      }
    });
  });
});
