"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const func = async (msg, { guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms, searcher, promptAmbig, author, botmember, member, actionLog, dummy, }) => {
    const actions = [
        (dummy.actions && dummy.actions[0]) || "Banning",
        (dummy.actions && dummy.actions[1]) || "Banned",
        (dummy.actions && dummy.actions[2]) || "banned",
        (dummy.actions && dummy.actions[3]) || "Ban",
        (dummy.actions && dummy.actions[4]) || "ban",
    ];
    if (!perms[dummy.perms || "ban"] && !hasPermission(["BAN_MEMBERS"])) {
        return reply("You do not have sufficient permissions! :frowning:");
    }
    else if (!botmember.hasPermission(["BAN_MEMBERS"])) {
        return reply("I do not have the permission `Ban Members`! :frowning:");
    }
    if (!args) {
        return reply(`Please tell me who to ${actions[4]}!`);
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
    // logger.debug(user, reason);
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
    else if (memberToUse.highestRole.position > member.highestRole.position && memberToUse.id !== guild.owner.id) {
        return reply("That member's highest role is higher in position than yours!");
    }
    else if (memberToUse.highestRole.position === member.highestRole.position && memberToUse.id !== guild.owner.id) {
        return reply("That member's highest role is the same in position as yours!");
    }
    else if (memberToUse.id === guild.owner.id) {
        return reply("That member is the owner!");
    }
    else if (!memberToUse.bannable) {
        return reply("That member is not bannable (being generic here). \
Check the conditions for being banned (e.g. must not be owner, etc)!");
    }
    const embed = new discord_js_1.RichEmbed();
    embed
        .setAuthor(`${actions[3]} confirmation - ${memberToUse.user.tag}`, memberToUse.user.displayAvatarURL)
        .setColor("RED")
        .setDescription(reason || "No reason")
        .setTimestamp(new Date());
    if (dummy.usePrompt == null || dummy.usePrompt) {
        const result = await prompt({
            question: `Are you sure you want to ${actions[4]} this member? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
            invalidMsg: "__Y__es or __n__o?",
            filter: (msg2) => {
                return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
            },
            timeout: deps_1.Time.seconds(15),
            cancel: false,
            options: { embed },
        });
        if (!result) {
            return;
        }
        if (/^n/i.test(result)) {
            send("Command cancelled.");
            return;
        }
    }
    const sentBanMsg = await send(`${actions[0]} ${memberToUse.user.tag}... (Sending DM...)`);
    const reasonEmbed = new discord_js_1.RichEmbed();
    reasonEmbed
        .setColor(dummy.color || "RED")
        .setDescription(reason || "None")
        .setTimestamp(new Date());
    const finish = () => {
        sentBanMsg.edit(`${actions[1]} ${memberToUse.user.tag} successfully.`).catch(funcs_1.rejct);
        actionLog({
            action_desc: `**{target}** was ${actions[2]}`,
            target: { toString: () => memberToUse.user.tag },
            type: actions[3],
            author: member,
            color: dummy.color || "RED",
            reason: reason || "None",
        }).catch(funcs_1.rejct);
    };
    const fail = (err) => {
        funcs_1.rejct(err);
        sentBanMsg.edit(`The ${actions[4]} failed! :frowning:`).catch(funcs_1.rejct);
    };
    const executeBan = () => {
        const banPrefix = `[${actions[3]} command executed by ${author.tag}] `;
        // const availableLength = 512 - (reason.length + banPrefix.length);
        const compressedText = funcs_1.textAbstract(banPrefix + (reason || "No reason given"), 512);
        memberToUse.ban({ days: dummy.days == null ? 1 : dummy.days, reason: compressedText }).then(() => {
            if (dummy.banType === "softban") {
                sentBanMsg.edit(`${actions[0]} ${memberToUse.user.tag}... (Waiting for unban...)`).catch(funcs_1.rejct);
                guild.unban(memberToUse.user).then(finish).catch(fail);
            }
            else {
                finish();
            }
        }).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    memberToUse.send(`You were ${actions[2]} at the server **${funcs_1.escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed }).then(() => {
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentBanMsg.edit(`${actions[0]} ${memberToUse.user.tag}... (DM Sent. Swinging ban hammer...)`).catch(funcs_1.rejct);
        executeBan();
    }).catch((err) => {
        funcs_1.rejct(err);
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentBanMsg.edit(`${actions[0]} ${memberToUse.user.tag}... (DM Failed. Swinging ban hammer anyway...)`).catch(funcs_1.rejct);
        executeBan();
    });
    setTimeout(() => {
        if (!sent) {
            timeoutRan = true;
            executeBan();
        }
    }, deps_1.Time.seconds(2.8));
};
exports.ban = new deps_1.Command({
    func,
    name: "ban",
    perms: "ban",
    description: "Ban a member.",
    example: "{p}ban @EvilGuy#0010 Being evil",
    category: "Moderation",
    args: { member: false, reason: true },
    guildOnly: true,
    default: false,
});
