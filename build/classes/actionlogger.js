"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sequelize_1 = require("../sequelize/sequelize");
const deps_1 = require("../util/deps");
const funcs_1 = require("../util/funcs");
/**
 * Main class for action logging.
 */
class ActionLog {
    /**
     * Log an action.
     * @param {LogOptions} options The options.
     * @returns {Promise<?Message>} The sent message.
     */
    async log(options) {
        const { action_desc, guild, author, reason, color, extraFields, target, type } = options;
        const logChannel = await this._getLog(guild);
        if (!logChannel) {
            return null;
        }
        const authorToUse = typeof author === "string" ?
            author :
            `<@${author.id}>`;
        let targetString;
        try {
            targetString = target.toString();
        }
        catch (err) {
            targetString = String(target);
        }
        const descToUse = action_desc.replace(/{target}/g, target instanceof discord_js_1.GuildMember ?
            target.user.username :
            target instanceof discord_js_1.User ?
                target.username :
                targetString);
        const embed = new discord_js_1.RichEmbed();
        const caseNum = await this._getCase(guild);
        if (typeof caseNum === "string" || isNaN(caseNum) || caseNum == null) {
            return;
        }
        let time = new deps_1.Time(1);
        const at = new Date();
        embed
            .setTitle(`Action Log ${caseNum + 1}`)
            .setDescription(descToUse)
            .setColor(color)
            .setTimestamp(at)
            .addField("Author", authorToUse, true);
        if (target instanceof discord_js_1.GuildMember || target instanceof discord_js_1.User) {
            const targetUser = target instanceof discord_js_1.GuildMember ? target.user : target;
            embed.setThumbnail(targetUser.displayAvatarURL);
        }
        if (extraFields) {
            for (const field of extraFields) {
                embed.addField(field[0], field[1], true);
                for (const val of field) {
                    const possibleDate = field[1];
                    if (typeof val === "string"
                        && /for/i.test(val)
                        && (possibleDate instanceof Date || possibleDate instanceof deps_1.Time)) {
                        time = possibleDate instanceof Date ? new deps_1.Time(possibleDate) : possibleDate;
                        const obj = { time };
                        console.log(obj.time);
                        break;
                    }
                }
            }
        }
        embed.addField("Reason", reason, false);
        let msgSent;
        try {
            const semiMsgSent = await logChannel.send({ embed });
            if (Array.isArray(semiMsgSent)) {
                msgSent = semiMsgSent[0];
            }
            else {
                msgSent = semiMsgSent;
            }
        }
        catch (err) {
            funcs_1.rejct(err);
            return null;
        }
        sequelize_1.cases.create({
            serverid: guild.id,
            type,
            moderator: author.id,
            case: caseNum + 1,
            time: at.getTime(),
            reason: reason || "None",
            duration: time ? time.time : null,
            messageid: msgSent.id,
        }).catch(funcs_1.rejct);
        try {
            const entry = await sequelize_1.moderation.findOne({ where: { serverid: guild.id } });
            entry.update({
                latestCase: caseNum + 1,
            }).catch(funcs_1.rejct);
        }
        catch (err) {
            deps_1.logger.error(`At updating moderation entry (Case num: ${caseNum}, guild: ${guild.id}): ${err}`);
        }
        return msgSent;
    }
    /**
     * Delete a case.
     * @param {number} caseN The case number.
     * @param {Guild} guild The guild to delete at.
     * @returns {Promise<boolean>} If it was deleted or not.
     */
    async delCase(caseN, guild) {
        const caseToLook = await sequelize_1.cases.find({ where: { case: caseN, serverid: guild.id } });
        if (!caseToLook) {
            return false;
        }
        const logChannel = await this._getLog(guild);
        if (!logChannel) {
            return false;
        }
        try {
            const logged = await logChannel.fetchMessage(caseToLook.messageid);
            logged.delete();
            caseToLook.destroy();
            return true;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Edit a case.
     * @param {string} reason The new reason.
     * @param {number} caseN The case number.
     * @param {Guild} guild The guild to edit at.
     * @returns {Promise<boolean>} If it was edited or not.
     */
    async editCase(reason, caseN, guild) {
        const caseToLook = await sequelize_1.cases.find({ where: { case: caseN, serverid: guild.id } });
        if (!caseToLook) {
            return false;
        }
        const logChannel = await this._getLog(guild);
        if (!logChannel) {
            return false;
        }
        try {
            const logged = await logChannel.fetchMessage(caseToLook.messageid);
            const oldEmbed = logged.embeds[0];
            const newEmbed = deps_1.msgEmbedToRich(oldEmbed);
            newEmbed.fields.forEach((field, i) => {
                if (field.name === "Reason") {
                    newEmbed.fields.splice(1, i);
                }
            });
            newEmbed.addField("Reason", reason, false);
            logged.edit({ embed: newEmbed });
            return true;
        }
        catch (err) {
            funcs_1.rejct(err);
            return false;
        }
    }
    /**
     * Get the log channel for a guild.
     * @param {Guild} guild The guild to get the log channel for.
     * @returns {Promise<?TextChannel>} The channel.
     * @private
     */
    async _getLog(guild) {
        const logChannel = await sequelize_1.moderation.findOne({ where: { serverid: guild.id } });
        if (logChannel) {
            const returnVal = guild.channels.get(logChannel.logs);
            if (returnVal && returnVal instanceof discord_js_1.TextChannel) {
                return returnVal;
            }
        }
        return null;
    }
    /**
     * Get the latest case for a guild.
     * @param {Guild} guild The guild to get the case for.
     * @returns {Promise<?string|number>} The case number.
     * @private
     */
    async _getCase(guild) {
        const logCase = await sequelize_1.moderation.findOne({ where: { serverid: guild.id } });
        if (logCase) {
            const returnVal = isNaN(logCase.latestCase) ? logCase.latestCase : Number(logCase.latestCase);
            if (typeof returnVal === "string" || typeof returnVal === "number") {
                return returnVal;
            }
        }
        return null;
    }
}
exports.default = new ActionLog();
