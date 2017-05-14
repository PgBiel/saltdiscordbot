"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const func = async (msg, { guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms, searcher, promptAmbig, author, botmember, member, actionLog, dummy, }) => {
    if (!perms.kick && !hasPermission(["KICK_MEMBERS"])) {
        return reply("You do not have sufficient permissions! :frowning:");
    }
    else if (!botmember.hasPermission(["KICK_MEMBERS"])) {
        return reply("I do not have the permission `Kick Members`! :frowning:");
    }
    if (!args) {
        return reply("Please tell me who to kick!");
    }
    let user;
    let reason;
    const [preUser, preReason] = [
        args.match(deps_1.Constants.regex.BAN_MATCH(true)), args.match(deps_1.Constants.regex.BAN_MATCH(false)),
    ];
    if (preUser) {
        user = preUser[1];
    }
    if (preReason) {
        reason = preReason[1];
    }
    if (!user && !reason) {
        return;
    }
    let memberToUse;
    let membersMatched;
    if (/[^]#\d{4}$/.test(user)) {
        const split = user.split("#");
        const discrim = split.pop();
        const username = split.join("#");
        memberToUse = guild.members.find((m) => m.user.username === username && m.user.discriminator === discrim);
    }
    else if (/^<@!?\d+>$/.test(user)) {
        memberToUse = guild.members.get(user.match(/^<@!?(\d+)>$/)[1]);
    }
    if (!memberToUse) {
        membersMatched = searcher.searchMember(user);
    }
    if (membersMatched && membersMatched.length < 1) {
        return reply("Member not found!");
    }
    else if (membersMatched && membersMatched.length === 1) {
        memberToUse = membersMatched[0];
    }
    else if (membersMatched && membersMatched.length > 1 && membersMatched.length < 10) {
        const result = await promptAmbig(membersMatched);
        if (result.cancelled) {
            return;
        }
        memberToUse = result.member;
    }
    else if (membersMatched) {
        return reply("Multiple members have matched your search. Please be more specific.");
    }
    if (!memberToUse) {
        return;
    }
    if (memberToUse.highestRole.position > botmember.highestRole.position) {
        return reply("That member's highest role is higher in position than mine!");
    }
    else if (memberToUse.highestRole.position === botmember.highestRole.position) {
        return reply("That member's highest role is the same in position as mine!");
    }
    else if (memberToUse.highestRole.position > member.highestRole.position && member.id !== guild.owner.id) {
        return reply("That member's highest role is higher in position than yours!");
    }
    else if (memberToUse.highestRole.position === member.highestRole.position && member.id !== guild.owner.id) {
        return reply("That member's highest role is the same in position as yours!");
    }
    else if (memberToUse.id === guild.owner.id) {
        return reply("That member is the owner!");
    }
    else if (!memberToUse.kickable) {
        return reply("That member is not kickable (being generic here). \
Check the conditions for being kicked (e.g. must not be owner, etc)!");
    }
    const sentKickMsg = await send(`Kicking ${memberToUse.user.tag}... (Sending DM...)`);
    const reasonEmbed = new discord_js_1.RichEmbed();
    reasonEmbed
        .setColor("ORANGE")
        .setDescription(reason || "None")
        .setTimestamp(new Date());
    const finish = () => {
        sentKickMsg.edit(`Kicked ${memberToUse.user.tag} successfully.`).catch(funcs_1.rejct);
        actionLog({
            action_desc: `**{target}** was kicked`,
            target: { toString: () => memberToUse.user.tag },
            type: "kick",
            author: member,
            color: "ORANGE",
            reason: reason || "None",
        }).catch(funcs_1.rejct);
    };
    const fail = (err) => {
        funcs_1.rejct(err);
        sentKickMsg.edit(`The kick failed! :frowning:`).catch(funcs_1.rejct);
    };
    const executeKick = () => {
        const kickPrefix = `[Kick command executed by ${author.tag}] `;
        const compressedText = funcs_1.textAbstract(kickPrefix + (reason || "No reason given"), 512);
        memberToUse.kick(compressedText).then(finish).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    memberToUse.send(`You were kicked at the server **${funcs_1.escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed }).then(() => {
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentKickMsg.edit(`Kicking ${memberToUse.user.tag}... (DM Sent. Kicking member...)`).catch(funcs_1.rejct);
        executeKick();
    }).catch((err) => {
        funcs_1.rejct(err);
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentKickMsg.edit(`Kicking ${memberToUse.user.tag}... (DM Failed. Kicking member anyway...)`).catch(funcs_1.rejct);
        executeKick();
    });
    setTimeout(() => {
        if (!sent) {
            timeoutRan = true;
            executeKick();
        }
    }, deps_1.Time.seconds(2.8));
};
exports.kick = new deps_1.Command({
    func,
    name: "kick",
    perms: "kick",
    description: "Kick a member.",
    example: "{p}kick @EvilGuy#0010 Being sort of evil",
    category: "Moderation",
    args: { member: false, reason: true },
    guildOnly: true,
    default: false,
});
