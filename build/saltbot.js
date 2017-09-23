"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
const cmd = require("commander");
const Discord = require("discord.js");
const changeConsole_1 = require("./changeConsole");
changeConsole_1.default(true);
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
Manager.spawn().then((shards) => {
    console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
    Manager.on("message", (message) => {
        if (message && message.type === "dbUpdate" && message.table && message.statement) {
            Manager.broadcast(message);
        }
    });
});
