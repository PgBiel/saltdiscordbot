"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const func = async (msg, { args, send, channel, member, author, guild }) => {
    let ripContent = "";
    if (!args) {
        ripContent = member ?
            member.displayName :
            author.username;
    }
    else if (channel instanceof discord_js_1.TextChannel) {
        ripContent = args.replace(/<@!?\d+>/g, (mention) => {
            const id = mention.match(/^<@!?(\d+)>$/)[1];
            const memberToUse = guild.members.get(id);
            if (!memberToUse) {
                return mention;
            }
            return memberToUse.displayName;
        });
    }
    else {
        ripContent = args;
    }
    return send(`http://ripme.xyz/#${encodeURIComponent(ripContent)}`);
};
exports.rip = new command_1.default({
    func,
    name: "rip",
    perms: "rip",
    default: true,
    description: "RIP. Generates a ripme.xyz link.",
    example: "{p}rip John",
    category: "Fun",
    args: { text: true },
    guildOnly: false,
});
