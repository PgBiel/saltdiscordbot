"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const punishment_1 = require("./punishment");
const ban_1 = require("./ban");
const kick_1 = require("./kick");
const mute_1 = require("./mute");
class Warn extends punishment_1.Punishment {
    /**
     * Warn someone.
     * @param {GuildMember} member The member that is being punished.
     * @param {Object} [options] Options to pass.
     * @param {GuildMember} [options.author] The author of the punishment.
     * @param {string} [options.reason] The reason of the punishment.
     * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
     * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
     * @param {boolean} [options.automatic] If this was an automatic warn.
     * @returns {Promise<void>}
     */
    async punish(member, { author, reason, auctPrefix, context, automatic } = { author: null, reason: null, auctPrefix: null, context: null, automatic: false }) {
        const guild = member.guild;
        const botmember = guild.me;
        const def = (...args) => Promise.resolve(null);
        const { reply = def, send = def, actionLog = def } = context;
        const sentWarnMsg = await send(`Warning ${member.user.tag}... (Sending DM...)`);
        const warns = deps_1.db.table("warns").get(guild.id, []).filter((u) => u.userid === member.id);
        const warnSteps = deps_1.db.table("warnsteps").get(guild.id, []).sort((step1, step2) => step1.amount - step2.amount);
        const warnStep = warnSteps.find((step) => step.amount === warns.length + 1);
        const reasonEmbed = new discord_js_1.RichEmbed();
        reasonEmbed
            .setColor("AQUA")
            .setDescription(reason || "None")
            .setTimestamp(new Date());
        const finish = () => {
            sentWarnMsg.edit(`Warned ${member.user.tag} successfully.`).catch(funcs_1.rejct);
            actionLog({
                action_desc: `**{target}** was warned`,
                target: member,
                type: "warn",
                author,
                color: "AQUA",
                reason: reason || "None",
            }).catch(funcs_1.rejct);
        };
        const fail = (err) => {
            funcs_1.rejct(err ? (err.err || err) : err);
            sentWarnMsg.edit(`The warn failed! :frowning:`).catch(funcs_1.rejct);
        };
        const executeWarnAsync = async () => {
            try {
                if (warnStep) {
                    const punishment = warnStep.punishment;
                    const timeNum = Number(warnStep.time);
                    const time = new deps_1.Time(isNaN(timeNum) ? deps_1.Time.minutes(10) : timeNum);
                    if (punishment === "kick" || punishment === "ban" || punishment === "softban") {
                        let reasonStr;
                        const ableName = punishment === "kick" ? "kick" : "bann";
                        if (member.highestRole.position > botmember.highestRole.position) {
                            reasonStr = "that member's highest role is higher in position than mine!";
                        }
                        else if (member.highestRole.position === botmember.highestRole.position) {
                            reasonStr = "that member's highest role is the same in position as mine!";
                        }
                        else if (member.id === guild.owner.id) {
                            reasonStr = "that member is the owner!";
                        }
                        else if (!member[ableName + "able"]) {
                            reasonStr = `that member is not ${ableName}able (being generic here). \
          Check the conditions for being ${ableName}ed (e.g. must not be owner, etc)!`;
                        }
                        if (reasonStr) {
                            return reply(`That member has reached a limit of ${warnStep.amount} warnings which implies \
a **${punishment}**, however I am not able to ${punishment} them because ${reasonStr}`);
                        }
                        sentWarnMsg.edit(`The member ${member} has reached a limit of ${warnStep.amount} warnings which implies \
a **${punishment}** (as says this server's current setup).`);
                        if (punishment === "kick") {
                            kick_1.default.punish(member, {
                                author, reason, auctPrefix, context,
                            });
                        }
                        else {
                            ban_1.default.punish(member, guild, context, {
                                author, reason, auctPrefix, usePrompt: false, days: 1, isSoft: punishment === "softban",
                            });
                        }
                    }
                    else if (punishment === "mute") {
                        sentWarnMsg.edit(`The member ${member} has reached a limit of ${warnStep.amount} warnings which implies a mute for \
**${time.toString()}**.`);
                        mute_1.default.punish(member, {
                            author, reason, auctPrefix, context, time, permanent: false,
                        });
                    }
                    if (warnStep.amount >= warnSteps[warnSteps.length - 1].amount) {
                        warns.forEach((warn) => {
                            deps_1.db.table("warns").remArr(guild.id, warn);
                        });
                    }
                }
                else {
                    await deps_1.db.table("warns").add(guild.id, {
                        userid: member.id,
                        reason: reason || "None",
                        moderatorid: author.id,
                        warnedat: Date.now().toString(),
                    }, true);
                    finish();
                }
            }
            catch (err) {
                fail(err);
            }
        };
        const executeWarn = () => {
            executeWarnAsync().catch((err) => { throw err; });
        };
        if (warnStep) {
            executeWarn();
        }
        else {
            let sent = false;
            let timeoutRan = false;
            member.send(`You were ${automatic ? "automatically " : ""}warned at the server **${funcs_1.escMarkdown(guild.name)}** for the \
reason of:`, { embed: reasonEmbed }).then(() => {
                if (timeoutRan) {
                    return;
                }
                sent = true;
                sentWarnMsg.edit(`Warning ${member.user.tag}... (DM Sent. Executing the warn...)`).catch(funcs_1.rejct);
                executeWarn();
            }).catch((err) => {
                funcs_1.rejct(err);
                if (timeoutRan) {
                    return;
                }
                sent = true;
                sentWarnMsg.edit(`Muting ${member.user.tag}... (DM Failed. Executing the warn anyways...)`).catch(funcs_1.rejct);
                executeWarn();
            });
            setTimeout(() => {
                if (!sent) {
                    timeoutRan = true;
                    executeWarn();
                }
            }, deps_1.Time.seconds(2.8));
        }
    }
}
exports.default = new Warn();
