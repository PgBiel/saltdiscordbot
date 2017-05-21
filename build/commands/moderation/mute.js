"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sequelize_1 = require("../../sequelize/sequelize");
const deps_1 = require("../../util/deps");
const funcs_1 = require("../../util/funcs");
const func = async (msg, { guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms, searcher, promptAmbig, author, botmember, member, actionLog, dummy, }) => {
    if (!perms.mute && (dummy.perms ? !perms[dummy.perms] : true) && !hasPermission(["MANAGE_ROLES"])) {
        return reply("You do not have sufficient permissions! :frowning:");
    }
    else if (!botmember.hasPermission(["MANAGE_ROLES"])) {
        return reply("I do not have the permission `Manage Roles`! :frowning:");
    }
    else if (!botmember.hasPermission(["MANAGE_CHANNELS"])) {
        return reply("I do not have the permission `Manage Channels`! :frowning:");
    }
    if (!args) {
        return reply("Please tell me who to mute!");
    }
    const { user, time, reason, ok: parseOk } = funcs_1.parseMute(args);
    deps_1.logger.debug("Mute Debug:", user, time, reason);
    if (!parseOk) {
        return reply("Member not found!");
    }
    if (!user) {
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
    /* // This code was used for time parsing.
    let timeToUse: Time = new Time(["m", 10]);
    if (time && !Constants.regex.MUTE.IS_NOTHING.test(time)) {
      if (Constants.regex.MUTE.IS_JUST_NUMBER.test(time)) {
        timeToUse = new Time(["m", Number(time)]);
      } else {
        timeToUse = new Time();
        const parsedTime = parseTimeStr(time);
        for (const unit of Object.getOwnPropertyNames(parsedTime)) {
          if (Time.validUnit(unit)) {
            timeToUse.add(unit, parsedTime[unit]);
          }
        }
      }
    } */
    const timeToUse = new deps_1.Time();
    if (time) {
        timeToUse.add(time);
    }
    else {
        timeToUse.add("m", 10);
    }
    const muteInfo = await sequelize_1.mutes.find({ where: { serverid: guild.id } });
    let muteRole;
    if (muteInfo) {
        muteRole = guild.roles.get(muteInfo.muteRoleID);
    }
    if (!muteRole) {
        try {
            const newRole = await funcs_1.createMutedRole(guild);
            const muteInstance = muteInfo || (await sequelize_1.mutes.create({
                serverid: guild.id,
            }));
            muteInstance.update({
                muteRoleID: newRole.id,
            }).catch(funcs_1.rejct);
            muteRole = newRole;
        }
        catch (err) {
            deps_1.logger.error(`At making mute role: ${err}`);
            return reply("I attempted to create role for muting, but I couldn't! :(");
        }
    }
    if (muteRole.position > botmember.highestRole.position) {
        return reply("The role used for muting has a higher position than my highest role!");
    }
    else if (muteRole.position === botmember.highestRole.position) {
        return reply("The role used for muting is my highest role!");
    }
    const sentMuteMsg = await send(`Muting ${memberToUse.user.tag}... (Sending DM...)`);
    const reasonEmbed = new discord_js_1.RichEmbed();
    reasonEmbed
        .setColor("GOLD")
        .setDescription(reason || "None")
        .setTimestamp(new Date());
    const finish = () => {
        sentMuteMsg.edit(`Muted ${memberToUse.user.tag} for **${timeToUse.toString()}** ${time ? "" : "(default) "}successfully.`).catch(funcs_1.rejct);
        actionLog({
            action_desc: `**{target}** was muted`,
            target: { toString: () => memberToUse.user.tag },
            extraFields: [["Muted For", timeToUse]],
            type: "mute",
            author: member,
            color: "GOLD",
            reason: reason || "None",
        }).catch(funcs_1.rejct);
    };
    const fail = (err) => {
        funcs_1.rejct(err);
        sentMuteMsg.edit(`The mute failed! :frowning:`).catch(funcs_1.rejct);
    };
    const executeMute = () => {
        memberToUse.addRole(muteRole).then(finish).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    memberToUse.send(`You were muted at the server **${funcs_1.escMarkdown(guild.name)}** for **${timeToUse.toString()}** for the reason of:`, { embed: reasonEmbed }).then(() => {
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentMuteMsg.edit(`Muting ${memberToUse.user.tag}... (DM Sent. Adding role for muting...)`).catch(funcs_1.rejct);
        executeMute();
    }).catch((err) => {
        funcs_1.rejct(err);
        if (timeoutRan) {
            return;
        }
        sent = true;
        sentMuteMsg.edit(`Muting ${memberToUse.user.tag}... (DM Failed. Adding role for muting anyway...)`).catch(funcs_1.rejct);
        executeMute();
    });
    setTimeout(() => {
        if (!sent) {
            timeoutRan = true;
            executeMute();
        }
    }, deps_1.Time.seconds(2.8));
};
exports.mute = new deps_1.Command({
    func,
    name: "mute",
    perms: "mute",
    description: `Mute a member. When time is not specified, it's 10 minutes by default. Time units:
  - For months, use one of \`month\`, \`months\`, \`mo\`.
  - For weeks, use one of \`week\`, \`weeks\`, \`w\`.
  - For days, use one of \`day\`, \`days\`, \`d\`.
  - For hours, use one of \`hour\`, \`hours\`, \`h\`.
  - For minutes, use one of \`minute\`, \`minutes\`, \`mins\`, \`min\`, \`m\`.
  - For seconds, use one of \`second\`, \`seconds\`, \`secs\`, \`sec\`, \`s\`.
  You can also use just a number in the \`time\` parameter to use minutes.`,
    example: `{p}mute @InsultGuy#0000 Calm down on the insults!
  {p}mute @InsultGuy#0000 1 hour 2 minutes Calm down.
  {p}mute @Spammer#0000 1 day Man stop spamming pls.`,
    category: "Moderation",
    args: { time: true, reason: true },
    guildOnly: true,
    default: false,
});
