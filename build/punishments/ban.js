"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const punishment_1 = require("./punishment");
class Ban extends punishment_1.Punishment {
    /**
     * Ban someone.
     * @param {GuildMember|User|string} member The member/user/id that is being punished.
     * @param {Guild} guild The guild to punish the member at.
     * @param {BaseContext<GuildChannel>} context The context of the command.
     * @param {Object} [options] Options to pass.
     * @param {GuildMember} [options.author] The author of the punishment.
     * @param {string} [options.reason] The reason of the punishment.
     * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
     * @param {string[]} [options.actions] The terminology for the ban actions.
     * @param {boolean} [options.usePrompt] If prompt should be used.
     * @param {string} [options.color] The color of the Embed's sidebar.
     * @param {number} [options.days] The amount of days to ban for.
     * @param {boolean} [options.isSoft] If it is a soft ban or not.
     * @returns {Promise<void>}
     */
    async punish(member, guild, context, { author, reason, auctPrefix, actions, usePrompt, color, days, isSoft } = {
            author: null, reason: null, auctPrefix: "", actions: ["Banning", "Banned", "banned", "Ban", "ban"], usePrompt: true,
            color: "RED", days: 1, isSoft: false,
        }) {
        const id = typeof member === "string" ? member : null;
        const user = member instanceof discord_js_1.GuildMember ? member.user : (member instanceof discord_js_1.User ? member : null);
        const botmember = guild.me;
        const def = (...args) => Promise.resolve(null);
        const { reply = def, send = def, actionLog = def, prompt } = context;
        if (author && member instanceof discord_js_1.GuildMember) {
            if (member.highestRole.position > botmember.highestRole.position) {
                return void reply("That member's highest role is higher in position than mine!");
            }
            else if (member.highestRole.position === botmember.highestRole.position) {
                return void reply("That member's highest role is the same in position as mine!");
            }
            else if (member.highestRole.position > author.highestRole.position && author.id !== guild.owner.id) {
                return void reply("That member's highest role is higher in position than yours!");
            }
            else if (member.highestRole.position === author.highestRole.position && author.id !== guild.owner.id) {
                return void reply("That member's highest role is the same in position as yours!");
            }
            else if (member.id === guild.owner.id) {
                return void reply("That member is the owner!");
            }
            else if (!member.bannable) {
                return void reply("That member is not bannable (being generic here). \
    Check the conditions for being banned (e.g. must not be owner, etc)!");
            }
        }
        if (usePrompt) {
            const embed = new discord_js_1.RichEmbed();
            embed
                .setAuthor(`${actions[3]} confirmation - ${id || user.tag}`, id ? undefined : user.displayAvatarURL)
                .setColor("RED")
                .setDescription(reason || "No reason")
                .setTimestamp(new Date());
            const result = await prompt({
                question: `Are you sure you want to ${actions[4]} this ${id ? "user ID" : "member"}? \
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
        const sentBanMsg = await send(`${actions[0]} ${id || user.tag}... (${id ?
            "Swinging ban hammer..." :
            "Sending DM..."})`);
        const reasonEmbed = new discord_js_1.RichEmbed();
        reasonEmbed
            .setColor(color || "RED")
            .setDescription(reason || "None")
            .setTimestamp(new Date());
        const finishAsync = async (target) => {
            let targetToUse;
            if (typeof target === "string") {
                sentBanMsg
                    .edit(`${actions[0]} ${id || user.tag}... (Banned successfully. Fetching username...)`)
                    .catch(funcs_1.rejct);
                try {
                    const bans = await guild.fetchBans();
                    targetToUse = bans.get(target) || target;
                }
                catch (err) {
                    targetToUse = target;
                }
            }
            else {
                targetToUse = target;
            }
            const name = targetToUse instanceof discord_js_1.GuildMember ?
                targetToUse.user.tag :
                targetToUse instanceof discord_js_1.User ?
                    targetToUse.tag :
                    targetToUse;
            sentBanMsg.edit(`${actions[1]} ${name} successfully.`).catch(funcs_1.rejct);
            const userTarget = targetToUse instanceof discord_js_1.GuildMember ? targetToUse.user : targetToUse;
            const logObj = {
                action_desc: `**{target}** was ${actions[2]}`,
                type: actions[3],
                author,
                color: color || "RED",
                reason: reason || "None",
                target: userTarget,
            };
            actionLog(logObj).catch(funcs_1.rejct);
        };
        const finish = (target) => {
            finishAsync(target).catch((err) => { throw err; });
        };
        const fail = (err) => {
            if (/Unknown ?User/i.test(err.toString()) && id) {
                sentBanMsg.edit(`A user with that ID does not exist!`).catch(funcs_1.rejct);
            }
            else {
                funcs_1.rejct(err);
                sentBanMsg.edit(`The ${actions[4]} failed! :frowning:`).catch(funcs_1.rejct);
            }
        };
        const executeBan = () => {
            // const availableLength = 512 - (reason.length + banPrefix.length);
            const compressedText = funcs_1.textAbstract(auctPrefix + (reason || "No reason given"), 512);
            guild.ban(member, { days: days == null ? 1 : days, reason: compressedText }).then((result) => {
                if (isSoft) {
                    sentBanMsg.edit(`${actions[0]} ${user.tag}... (Waiting for unban...)`).catch(funcs_1.rejct);
                    guild.unban(user).then(finish).catch(fail);
                }
                else {
                    finish(result);
                }
            }).catch(fail);
        };
        let sent = false;
        let timeoutRan = false;
        if (typeof member !== "string") {
            member.send(`You were ${actions[2]} at the server **${funcs_1.escMarkdown(guild.name)}** for the reason of:`, { embed: reasonEmbed }).then(() => {
                if (timeoutRan) {
                    return;
                }
                sent = true;
                sentBanMsg.edit(`${actions[0]} ${user.tag}... (DM Sent. Swinging ban hammer...)`).catch(funcs_1.rejct);
                executeBan();
            }).catch((err) => {
                funcs_1.rejct(err);
                if (timeoutRan) {
                    return;
                }
                sent = true;
                sentBanMsg.edit(`${actions[0]} ${user.tag}... (DM Failed. Swinging ban hammer anyway...)`).catch(funcs_1.rejct);
                executeBan();
            });
        }
        else {
            sent = true;
            executeBan();
        }
        setTimeout(() => {
            if (!sent) {
                timeoutRan = true;
                executeBan();
            }
        }, deps_1.Time.seconds(2.8));
    }
}
exports.default = new Ban();
