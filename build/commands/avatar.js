"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../classes/command");
const deps_1 = require("../util/deps");
function getAvatarEmb(author) {
    const avatarRegex = /^((?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpe?g|png|gif|webp))\?size=\d+$/;
    const embed = new discord_js_1.RichEmbed();
    const tag = `${author.username}#${author.discriminator}`;
    const avatarUrl = avatarRegex.test(author.displayAvatarURL) ?
        author.displayAvatarURL.match(avatarRegex)[1]
        : author.displayAvatarURL;
    embed.setAuthor(`${tag}'s Avatar`, avatarUrl, avatarUrl)
        .setImage(avatarUrl)
        .setFooter(`User's ID: ${author.id}`);
    return embed;
}
const func = async (msg, { channel, guildId, author, args, arrArgs, send, reply, searcher, promptAmbig, }) => {
    if (arrArgs.length < 1 || !(channel instanceof discord_js_1.TextChannel)) {
        if (!(channel instanceof discord_js_1.TextChannel)) {
            author = deps_1.bot.user;
        }
        const embed = getAvatarEmb(author);
        send(`${arrArgs.length > 0 ?
            "This is a DM and there is nobody here other than me and you, so here's my avatar." :
            ""}`, { embed });
    }
    else {
        if (/^<@\d+>$/.test(args)) {
            const user = deps_1.bot.users.get(args.match(/^<@(\d+)>$/)[1]);
            if (!user) {
                return reply("Invalid member given!");
            }
            const embed = getAvatarEmb(user);
            return send({ embed });
        }
        const members = searcher.searchMember(args);
        deps_1.logger.debug(args);
        if (members.length < 1) {
            return reply("Member not found!");
        }
        if (members.length > 1 && members.length < 10) {
            const ambResult = await promptAmbig(members);
            if (ambResult.cancelled) {
                return;
            }
            if (ambResult.member) {
                const member = ambResult.member;
                const embed = getAvatarEmb(member.user);
                send({ embed });
                return;
            }
        }
        if (members.length === 1) {
            const embed = getAvatarEmb(members[0].user);
            send({ embed });
            return;
        }
        return reply("Multiple members were found in your search. Please be more specific.");
    }
};
exports.avatar = new command_1.default({
    func,
    name: "avatar",
    description: "View the avatar of you or someone else.",
    example: "{p}avatar",
    category: "Utility",
    guildOnly: false,
});
