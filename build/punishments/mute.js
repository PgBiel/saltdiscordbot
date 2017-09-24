"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const punishment_1 = require("./punishment");
class Mute extends punishment_1.Punishment {
    /**
     * Mute someone.
     * @param {GuildMember} member The member that is being punished.
     * @param {Object} [options] Options to pass.
     * @param {GuildMember} [options.author] The author of the punishment.
     * @param {string} [options.reason] The reason of the punishment.
     * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
     * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
     * @param {Time} [options.time] For how long the member should be muted.
     * @param {boolean} [options.permanent] If the member is permanently muted.
     * @returns {Promise<void>}
     */
    async punish(member, { author, reason, auctPrefix, context, time, permanent } = { author: null, reason: null, auctPrefix: null, context: null, time: new deps_1.Time(["m", 10]), permanent: false }) {
        const guild = member.guild;
        const botmember = guild.me;
        const def = (...args) => Promise.resolve(null);
        const { reply = def, send = def, actionLog = def } = context;
        if (!time)
            time = new deps_1.Time(["m", 10]);
        const muteInfo = deps_1.db.table("mutes").get(guild.id);
        let muteRole;
        if (muteInfo) {
            muteRole = guild.roles.get(muteInfo.muteRoleID);
        }
        if (!muteRole) {
            try {
                const newRole = await funcs_1.createMutedRole(guild);
                deps_1.db.table("mutes").assign(guild.id, { muteRoleID: newRole.id });
                muteRole = newRole;
            }
            catch (err) {
                deps_1.logger.error(`At making mute role: ${err}`);
                return void reply("I attempted to create role for muting, but I couldn't! :frowning:");
            }
        }
        /* if (memberToUse.id === guild.owner.id) {
          return reply("That user is the owner, so muting would have no effect!");
        } else if (memberToUse.hasPermission(["ADMINISTRATOR"])) {
          return reply("That user has `Administrator` permissions, so muting would have no effect!");
        } else */
        if (muteRole.position > botmember.highestRole.position) {
            return void reply("The role used for muting has a higher position than my highest role!");
        }
        else if (muteRole.position === botmember.highestRole.position) {
            return void reply("The role used for muting is my highest role!");
        }
        const sentMuteMsg = await send(`Muting ${member.user.tag}... (Sending DM...)`);
        const reasonEmbed = new discord_js_1.RichEmbed();
        reasonEmbed
            .setColor("GOLD")
            .setDescription(reason || "None")
            .setTimestamp(new Date());
        const finish = () => {
            sentMuteMsg.edit(`Muted ${member.user.tag} for **${time.toString()}** ${time ? "" : "(default) "}successfully.`).catch(funcs_1.rejct);
            actionLog({
                action_desc: `**{target}** was muted`,
                target: member,
                extraFields: [["Muted For", time]],
                type: "mute",
                author: member,
                color: "GOLD",
                reason: reason || "None",
            }).catch(funcs_1.rejct);
        };
        const fail = (err) => {
            funcs_1.rejct(err ? (err.err || err) : err);
            sentMuteMsg.edit(`The mute failed! :frowning:`).catch(funcs_1.rejct);
        };
        const executeMute = () => {
            const timestamp = new deps_1.Time(Date.now())
                .add(time)
                .time.toString();
            deps_1.db.table("activemutes").add(guild.id, {
                userid: member.id,
                timestamp,
                permanent: Boolean(permanent),
            }).then(() => {
                member.addRole(muteRole).then(finish).catch(fail);
            }).catch(fail);
        };
        let sent = false;
        let timeoutRan = false;
        member.send(`You were muted at the server **${funcs_1.escMarkdown(guild.name)}** for **${time}** for the reason of:`, { embed: reasonEmbed }).then(() => {
            if (timeoutRan) {
                return;
            }
            sent = true;
            sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Sent. Adding role for muting...)`).catch(funcs_1.rejct);
            executeMute();
        }).catch((err) => {
            funcs_1.rejct(err);
            if (timeoutRan) {
                return;
            }
            sent = true;
            sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Failed. Adding role for muting anyway...)`).catch(funcs_1.rejct);
            executeMute();
        });
        setTimeout(() => {
            if (!sent) {
                timeoutRan = true;
                executeMute();
            }
        }, deps_1.Time.seconds(2.8));
    }
}
exports.default = new Mute();
