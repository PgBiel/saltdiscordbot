"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
const punishment_1 = require("./punishment");
class Kick extends punishment_1.Punishment {
    /**
     * Kick someone.
     * @param {GuildMember} member The member that is being punished.
     * @param {string} [reason] The reason of the punishment.
     * @param {string} [auctPrefix] A prefix to be included on the audit logs.
     * @param {Function} [reply] A function that takes a string argument and replies.
     * @param {Function} [send] A function that takes a string argument and sends.
     * @param {Function} [actionLog] A function that takes any argument to action log.
     * @returns {void}
     */
    async punish(member, author, reason, auctPrefix, context) {
        const guild = member.guild;
        const botmember = guild.me;
        const def = (...args) => null;
        const { reply = def, send = def, actionLog = def } = context;
        if (author) {
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
            else if (!member.kickable) {
                return void reply("That member is not kickable (being generic here). \
    Check the conditions for being kicked (e.g. must not be owner, etc)!");
            }
        }
        const sentKickMsg = await send(`Kicking ${member.user.tag}... (Sending DM...)`);
        const isMsg = sentKickMsg instanceof discord_js_1.Message;
        const reasonEmbed = new discord_js_1.RichEmbed();
        reasonEmbed
            .setColor("ORANGE")
            .setDescription(reason || "None")
            .setTimestamp(new Date());
        const finish = () => {
            if (isMsg) {
                sentKickMsg.edit(`Kicked ${member.user.tag} successfully.`).catch(funcs_1.rejct);
            }
            actionLog({
                action_desc: `**{target}** was kicked`,
                target: member,
                type: "kick",
                author: member,
                color: "ORANGE",
                reason: reason || "None",
            }).catch(funcs_1.rejct);
        };
        const fail = (err) => {
            funcs_1.rejct(err);
            if (isMsg) {
                sentKickMsg.edit(`The kick failed! :frowning:`).catch(funcs_1.rejct);
            }
        };
        const executeKick = () => {
            // const kickPrefix = origin ? `[Kick command executed by ${origin.tag}] ` : "";
            const compressedText = funcs_1.textAbstract(auctPrefix + " " + (reason || "No reason given"), 512);
            member.kick(deps_1.querystring.escape(compressedText)).then(finish).catch(fail);
        };
    }
}
exports.default = new Kick();
