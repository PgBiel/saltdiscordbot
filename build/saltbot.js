"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("chalk");
const cmd = require("commander");
const Discord = require("discord.js");
require("./changeConsole");
cmd
    .option("-b", "--beta", "Is beta or not")
    .parse(process.argv);
process.chdir(`${process.env.HOME}/Documents/Bot Stuff/${cmd.beta ? "Beta " : ""}Salt/build`);
const Manager = new Discord.ShardingManager("./bot.js", {
    totalShards: 2,
});
Manager.spawn().then((shards) => {
    console.log("Spawned", colors.cyan(shards.size.toString()), "shards!");
});
