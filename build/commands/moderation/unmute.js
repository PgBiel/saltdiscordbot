"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sequelize_1 = require("../../sequelize/sequelize");
const deps_1 = require("../../util/deps");
const funcs_1 = require("../../util/funcs");
const func = async (msg, { guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms, setPerms, searcher, promptAmbig, author, botmember, member, actionLog, dummy, checkRole, }) => {
    let hasPerm = false;
    if (hasPermission(["MANAGE_ROLES"])) {
        hasPerm = true;
    }
    try {
        if (await checkRole("mod", member)) {
            hasPerm = true;
        }
    }
    catch (err) {
        deps_1.logger.error(`At check role: ${err}`);
    }
    if (setPerms.unmute) {
        if (!perms.unmute) {
            hasPerm = false;
        }
        if (dummy.perms && !perms[dummy.perms] && setPerms[dummy.perms]) {
            hasPerm = false;
        }
    }
    if (!hasPerm) {
        return reply("You do not have sufficient permissions! :frowning:");
    }
    else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
        return reply("I do not have the permission `Manage Roles`! :frowning:");
    }
    if (!args) {
        return reply("Please tell me who to unmute!");
    }
    const [user, reason] = deps_1._.tail((args.match(deps_1.Constants.regex.BAN_MATCH) || Array(3)));
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
    const muteInfo = await sequelize_1.mutes.find({ where: { serverid: guild.id } });
    let muteRole;
    if (muteInfo) {
        muteRole = guild.roles.get(muteInfo.muteRoleID);
    }
    if (!muteRole) {
        return reply("That member is not muted!");
    }
    const activeMute = await sequelize_1.activemutes.findOne({ where: { serverid: guild.id, userid: memberToUse.id } });
    if (!activeMute) {
        return reply("That member is not muted!");
    }
    if (muteRole.position > botmember.highestRole.position) {
        return reply("The role used for muting has a higher position than my highest role!");
    }
    else if (muteRole.position === botmember.highestRole.position) {
        return reply("The role used for muting is my highest role!");
    }
    const sentMuteMsg = await send(`Unmuting ${memberToUse.user.tag}... (Sending DM...)`);
    const reasonEmbed = new discord_js_1.RichEmbed();
    reasonEmbed
        .setColor("GREEN")
        .setDescription(reason || "None")
        .setTimestamp(new Date());
    const finish = () => {
        sentMuteMsg.edit(`Unmuted ${memberToUse.user.tag} successfully.`).catch(funcs_1.rejct);
        actionLog({
            action_desc: `**{target}** was unmuted`,
            target: memberToUse,
            type: "unmute",
            author: member,
            color: "GREEN",
            reason: reason || "None",
        }).catch(funcs_1.rejct);
    };
    const fail = (err) => {
        funcs_1.rejct(err);
        sentMuteMsg.edit(`The unmute failed! :frowning:`).catch(funcs_1.rejct);
    };
    const executeUnmute = () => {
        activeMute.destroy().then(() => {
            memberToUse.removeRole(muteRole).then(finish).catch(fail);
        }).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    memberToUse.send(`Your mute at the server **${funcs_1.escMarkdown(guild.name)}** was lifted for the reason of:`, { embed: reasonEmbed }).then(() => {
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Sent. Removing muting role...)`).catch(funcs_1.rejct);
        executeUnmute();
    }).catch((err) => {
        funcs_1.rejct(err);
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentMuteMsg.edit(`Unmuting ${memberToUse.user.tag}... (DM Failed. Removing muting role anyway...)`).catch(funcs_1.rejct);
        executeUnmute();
    });
    setTimeout(() => {
        if (!sent) {
            timeoutRan = true;
            executeUnmute();
        }
    }, deps_1.Time.seconds(2.8));
};
exports.unmute = new deps_1.Command({
    func,
    name: "unmute",
    perms: "unmute",
    description: `Unmute a muted member.`,
    category: "Moderation",
    args: { reason: true },
    guildOnly: true,
    default: false,
});
