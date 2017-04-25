"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
const cmd = require("commander");
const Discord = require("discord.js");
const util_1 = require("util");
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
console.log(dir, util_1.inspect(cmd));
process.chdir(dir);
const Manager = new Discord.ShardingManager("./bot.js", {
    totalShards: 2,
});
Manager.spawn().then((shards) => {
    console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
});
