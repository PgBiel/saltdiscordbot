"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const func = async (msg, { send }) => {
    const now = Date.now();
    const sentmsg = await send("Calculating ping...");
    sentmsg.edit(`Pong! ${Date.now() - now}ms.`);
};
exports.ping = new command_1.default({
    func,
    name: "ping",
    description: "View the ping of the bot.",
    example: "{p}ping",
    category: "Utility",
    guildOnly: false,
});
