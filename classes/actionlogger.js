const { GuildMember, MessageEmbed, User } = require("discord.js");
// const { cases, moderation } = require("../sequelize/sequelize");
const { bot, db, logger, moment, msgEmbedToRich, Time } = require("../util/deps");
const { cloneObject, rejct } = require("../util/funcs");

/**
 * Options for editing a case. (TypeScript remainder)
 */
/* export interface ICaseEditOptions {
  /**
   * A new reason.
   * @type {string}
   * /
  reason?: string;
  /**
   * To toggle thumbnail.
   * @type {string}
   * /
  toggleThumbnail?: boolean;
} */

/**
 * Options for action logging. (Typescript Remainder)
 */
/* export interface ILogOption {
  /**
   * Describes the action. Replaces {target} by action target
   * @type {string}
   * /
  action_desc: string;
  /**
   * Whatever is targeted by the action.
   * @type {*}
   * /
  target: any;
  /**
   * ID of the target.
   * @type {?string}
   * /
  targetId?: string;
  /**
   * A thumbnail.
   * @type {?string}
   * /
  thumbnail?: string;
  /**
   * The type (i.e. punishment).
   * /
  type: string;
  /**
   * The author of the action.
   * @type {User|GuildMember}
   * /
  author: User | GuildMember;
  /**
   * The reason that the action was done.
   * @type {?string}
   * /
  reason?: string;
  /**
   * The color to use.
   * @type {ColorResolvable}
   * /
  color: ColorResolvable;
  /**
   * Any extra fields that appear next to the author field.
   * @type {?Array<Array<string, string | Date | Time | number>>}
   * /
  extraFields?: Array<[string, string | Date | Time | number]>;
} */

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
    const {
      action_desc, guild, author, reason, color, extraFields, target, type,
      targetId, thumbnail, time
    } = options;
    const caseNum = Number(this._getCase(guild)) || 0;
    // let time = new Time(1);
    const at = new Date();
    let thumbnailToUse;
    let idToUse;
    if (target instanceof GuildMember || target instanceof User) {
      const targetUser = target.user || target;
      thumbnailToUse = targetUser.displayAvatarURL();
      idToUse = targetUser.id;
    } else {
      thumbnailToUse = thumbnail;
      idToUse = targetId;
    }
    const caseObj = {
      type,
      moderator: author.id,
      case: caseNum + 1,
      target: idToUse,
      time: at.getTime().toString(),
      reason: reason || "None",
      duration: time ? time.time.toString() : null,
      deleted: false,
      // messageid: msgSent.id,
      thumbOn: true,
      thumbnail: thumbnailToUse,
      description: action_desc,
      color,
      extraFields
    };
    const embed = await this.embedAction(caseObj);
    let msgSent;
    try {
      const logChannel = this._getLog(guild);
      if (logChannel) {
        const semiMsgSent = await logChannel.send({ embed });
        if (Array.isArray(semiMsgSent)) {
          msgSent = semiMsgSent[0];
        } else {
          msgSent = semiMsgSent;
        }
      }
    } catch (err) {
      rejct(err);
      return null;
    }
    caseObj.messageid = msgSent.id;
    db.table("punishments").add(guild.id, caseObj);
    try {
      db.table("mods").assign(guild.id, { latestCase: caseNum + 1 }, true);
    } catch (err) {
      logger.error(`At updating moderation entry (Case num: ${caseNum}, guild: ${guild.id}): ${err.stack || err}`);
    }
    return msgSent;
  }

  /**
   * Delete a case.
   * @param {number} caseN The case number.
   * @param {Guild} guild The guild to delete at.
   * @returns {Promise<Object>} If it was deleted or not.
   */
  async delCase(caseN, guild) {
    const cases = db.table("punishments");
    const caseToLook = cases
      .get(guild.id)
      .find(punish => punish.case === caseN);
    const obj = { case: false, message: false };
    if (!caseToLook) {
      return obj;
    }
    const newCaseToLook = cloneObject(caseToLook);
    newCaseToLook.deleted = true;
    try {
      await (db
        .table("punishments")
        .assign(guild.id, { [db.table("punishments").indexOf(guild.id, caseToLook)]: newCaseToLook }, true));
    } catch (err) {
      rejct(err);
      return obj;
    }
    obj.case = true;
    const logChannel = this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.fetchMessage(caseToLook.messageid);
      await logged.delete();
      obj.message = true;
    } catch (err) {
      rejct(err);
    }
    return obj;
  }

  /**
   * Get a specific case.
   * @param {number} caseN The case number.
   * @param {Guild|string} The guild to look at (or its id).
   * @returns {Promise<Object>} The result.
   */
  async fetchCase(caseN, guild) {
    const cases = db.table("punishments");
    const caseToLook = cases
      .get(guild.id)
      .find(punish => punish.case === caseN);
    const obj = { case: null, embed: null, message: null };
    if (!caseToLook) {
      return obj;
    }
    obj.case = caseToLook;
    obj.embed = await this.embedAction(caseToLook);
    const logChannel = this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.fetchMessage(caseToLook.messageid);
      obj.message = logged;
      return obj;
    } catch (err) {
      rejct(err);
      return obj;
    }
  }

  /**
   * Edit a case.
   * @param {number} caseN The case number.
   * @param {Object} options The options.
   * @param {string} [options.reason] The reason to set.
   * @param {boolean} [options.toggleThumbnail] If it should toggle thumbnail.
   * @param {Guild} guild The guild to edit at.
   * @returns {Promise<Object>} Two properties saying if it was edited or not.
   */
  async editCase(caseN, options, guild) {
    const cases = db.table("punishments");
    const caseToLook = cases
      .get(guild.id)
      .find(punish => punish.case === caseN);
    const obj = { case: false, message: false, resultCase: null };
    if (!caseToLook) {
      return obj;
    }
    const newCaseToLook = cloneObject(caseToLook);
    if (options.reason) {
      caseToLook.reason = options.reason;
    }
    if (options.toggleThumbnail) {
      caseToLook.thumbOn = !caseToLook.thumbOn;
    }
    try {
      await (db
        .table("punishments")
        .assign(guild.id, { [db.table("punishments").indexOf(guild.id, caseToLook)]: newCaseToLook }, true));
      obj.case = true;
      obj.resultCase = newCaseToLook;
    } catch (err) {
      rejct(err);
      return obj;
    }
    const logChannel = this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.fetchMessage(caseToLook.messageid);
      const oldEmbed = logged.embeds[0];
      const newEmbed = await this.embedAction(newCaseToLook);
      await logged.edit({ embed: newEmbed });
      obj.message = true;
      return obj;
    } catch (err) {
      rejct(err);
      return obj;
    }
  }

  async embedAction(action) {
    const embed = new MessageEmbed();
    const {
      case: num, target, description, color, time, moderator, reason, thumbnail, thumbnailOn,
      extraFields
    } = action;
    let text;
    if (target instanceof GuildMember) {
      text = target.user.username;
    } else if (target instanceof User) {
      text = target.username;
    } else {
      try {
        const awaited = bot.users.get(target) || (await bot.users.fetch(target));
        text = awaited.username;
      } catch (_err) {
        text = String(target || "Clyde");
      }
    }
    const descToUse = (description || "Something happened to {target}").replace(/{target}/g, text || "Clyde");
    const numTime = Number(time);
    embed
      .setTitle(`Action Log ${num || "???"}`)
      .setDescription(descToUse)
      .setColor(color || "RANDOM")
      .setTimestamp(isNaN(numTime) ? new Date() : new Date(numTime))
      .addField("Author", `<@${moderator || "1"}>`, true)
      .setFooter(`Target Member's ID: ${target || "666"}`);
    if (extraFields) for (const field of extraFields) embed.addField(field[0], field[1], true);
    if (thumbnailOn) embed.setThumbnail(thumbnail || bot.user.defaultAvatarURL);
    embed.addField("Reason", reason || "None", false);
    return embed;
  }


  /**
   * Get the log channel for a guild.
   * @param {Guild} guild The guild to get the log channel for.
   * @returns {Promise<?TextChannel>} The channel.
   * @private
   */
  _getLog(guild) {
    const logChannel = db.table("mods").prop(guild.id || guild, "logs");
    if (logChannel) {
      const returnVal = guild.channels.get(logChannel);
      if (returnVal && returnVal.type === "text") {
        return returnVal;
      }
    }
    return null;
  }

  /**
   * Get the latest case for a guild.
   * @param {Guild} guild The guild to get the case for.
   * @returns {?string|number} The case number.
   * @private
   */
  _getCase(guild) {
    const logCase = db.table("mods").prop(guild.id, "latestCase");
    if (logCase) {
      const returnVal = isNaN(logCase) ? logCase : Number(logCase);
      if (typeof returnVal === "string" || typeof returnVal === "number") {
        return returnVal;
      }
    }
    return 0;
  }
}
module.exports = new ActionLog();
