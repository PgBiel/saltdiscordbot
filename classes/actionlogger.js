const { Guild, GuildMember, MessageEmbed, User } = require("discord.js");
// const { cases, moderation } = require("../sequelize/sequelize");
const { bot, Constants, db, Interval, logger, moment, msgEmbedToRich, Time } = require("../util/deps");
const {
  avatarCompress, avatarUncompress, cloneObject, compress, datecomp, dateuncomp, rejct, textAbstract, uncompress,
  durationcompress, durationdecompress
} = require("../util/funcs");

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
   * @param {object} options The options.
   * @param {Guild} options.guild The guild to operate.
   * @param {User} options.author The author of the punishment.
   * @param {string} [options.reason] Optional reason.
   * @param {GuildMember|User} options.target The target.
   * @param {string} options.type The punishment type.
   * @param {Interval} [options.time] Duration of punishment.
   * @returns {Promise<[Message, number]>} The sent message and case number.
   */
  async log(options) {
    const {
      guild, author, reason, target, type,
      targetId, thumbnail, time
    } = options;
    const caseNum = Number(await this._getCase(guild)) || 0;
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
      moderator: compress(author.id),
      case: caseNum + 1,
      target: compress(idToUse),
      time: datecomp(at),
      reason: textAbstract(reason, 500) || "None",
      duration: time ? durationcompress(time) : null,
      deleted: false,
      // messageid: msgSent.id,
      thumbOn: true,
      thumbnail: avatarCompress(thumbnailToUse)
    };
    const embed = await this.embedAction(caseObj);
    let msgSent;
    try {
      const logChannel = await this._getLog(guild);
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
    caseObj.messageid = compress(msgSent.id);
    db.table("punishments").add(guild.id, caseObj);
    guild.members.fetch().catch(rejct);
    const maxCases = Constants.numbers.MAX_CASES(guild.members.size);
    if ((await (db.table("punishments").get(guild.id, [])).length) > maxCases) {
      db.table("punishments").spliceArr(guild.id, 0, 1);
    }
    try {
      await (db.table("mods").assign(guild.id, { latestCase: caseNum + 1 }, true));
    } catch (err) {
      logger.error(`At updating moderation entry (Case num: ${caseNum}, guild: ${guild.id}): ${err.stack || err}`);
    }
    return [msgSent, caseNum + 1];
  }

  /**
   * Delete a case.
   * @param {number} caseN The case number.
   * @param {Guild} guild The guild to delete at.
   * @returns {Promise<Object>} If it was deleted or not.
   */
  async delCase(caseN, guild) {
    const cases = db.table("punishments");
    const caseToLook = (await cases.get(guild.id, [])).find(punish => punish.case === caseN);
    const obj = { case: false, message: false };
    if (!caseToLook) {
      return obj;
    }
    const newCaseToLook = cloneObject(caseToLook);
    newCaseToLook.deleted = true;
    try {
      await (db
        .table("punishments")
        .assign(guild.id, { [await (db.table("punishments").indexOf(guild.id, caseToLook))]: newCaseToLook }, true));
    } catch (err) {
      rejct(err);
      return obj;
    }
    obj.case = true;
    if (caseToLook.type === "w") {
      try {
        const warns = await (db.table("warns").get(guild.id, []));
        const warn = warns.find(w => w.casenumber === caseN);
        if (warn) db.table("warns").remArr(guild.id, warn);
      } catch (err) {
        rejct(err);
      }
    }
    const logChannel = await this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.messages.fetch(uncompress(caseToLook.messageid));
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
   * @param {Guild|string} guild The guild to look at (or its id).
   * @returns {Promise<object>} The result.
   */
  async fetchCase(caseN, guild) {
    const cases = db.table("punishments");
    const caseToLook = (await cases.get(guild.id, [])).find(punish => punish.case === caseN);
    const obj = { case: null, embed: null, message: null };
    if (!caseToLook) {
      return obj;
    }
    obj.case = caseToLook;
    obj.embed = await this.embedAction(caseToLook);
    const logChannel = await this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.messages.fetch(uncompress(caseToLook.messageid));
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
   * @returns {Promise<object>} Two properties saying if it was edited or not.
   */
  async editCase(caseN, options, guild) {
    const cases = db.table("punishments");
    const caseToLook = (await cases.get(guild.id, [])).find(punish => punish.case === caseN);
    const obj = { case: false, message: false, resultCase: null };
    if (!caseToLook) {
      return obj;
    }
    const newCaseToLook = cloneObject(caseToLook);
    if (options.reason) {
      newCaseToLook.reason = textAbstract(options.reason, 500);
    }
    if (options.moderator) {
      newCaseToLook.moderator = compress(options.moderator);
    }
    if (options.toggleThumbnail) {
      newCaseToLook.thumbOn = !caseToLook.thumbOn;
    }
    try {
      await (db
        .table("punishments")
        .assign(guild.id, { [await (db.table("punishments").indexOf(guild.id, caseToLook))]: newCaseToLook }, true));
      obj.case = true;
    } catch (err) {
      rejct(err);
      return obj;
    }
    if (caseToLook.type === "w" && (options.reason || options.moderator)) {
      try {
        const warns = await (db.table("warns").get(guild.id, []));
        const warn = warns.find(w => w.casenumber === caseN);
        if (warn) {
          const index = await (db.table("warns").indexOf(guild.id, warn));
          const newWarn = cloneObject(warn);
          if (options.reason) newWarn.reason = textAbstract(options.reason, 500);
          if (options.moderator) newWarn.moderatorid = compress(options.moderator);
          db.table("warns").assign(guild.id, { [index]: newWarn });
        }
      } catch (err) {
        rejct(err);
      }
    }
    const logChannel = await this._getLog(guild);
    if (!logChannel) {
      return obj;
    }
    try {
      const logged = await logChannel.messages.fetch(uncompress(caseToLook.messageid));
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

  /**
   * Embed an action.
   * @param {object} [action] The action object.
   * @returns {MessageEmbed}
   */
  async embedAction(action = {}) {
    const embed = new MessageEmbed();
    const {
      case: num, target, time, moderator, reason, thumbnail, thumbOn, type,
      duration: oDuration
    } = action;
    const duration = oDuration ? String(new Interval(durationdecompress(oDuration))) : "0 seconds";
    const uncTarget = uncompress(target || compress("666"));
    const [, description, color, extraFields] = Constants.maps.PUNISHMENTS[type] || [];
    let text;
    if (target instanceof GuildMember) {
      text = target.user.username;
    } else if (target instanceof User) {
      text = target.username;
    } else {
      try {
        const awaited = bot.users.get(uncTarget) || (await bot.users.fetch(uncTarget));
        text = awaited.username;
      } catch (_err) {
        text = String(target || "Clyde");
      }
    }
    const descToUse = (description || "Something happened to {target}").replace(/{target}/g, text || "Clyde");
    let numTime;
    try {
      numTime = dateuncomp(time);
    } catch(err) {
      numTime = new Date();
    }
    embed
      .setTitle(`Action Log #${num || "???"}`)
      .setDescription(descToUse)
      .setColor(color || "RANDOM")
      .setTimestamp(numTime || new Date())
      .addField("Author", `<@${uncompress(moderator || compress("1")) || "1"}>`, true)
      .setFooter(`Target Member's ID: ${uncTarget || "666"}`);
    if (extraFields) {
      for (const field of extraFields) {
        embed.addField(field[0], field[1] === "<d>" ? duration : field[1], true);
      }
    }
    if (thumbOn) embed.setThumbnail(avatarUncompress(thumbnail, uncTarget) || bot.user.defaultAvatarURL);
    embed.addField("Reason", reason || "None", false);
    return embed;
  }


  /**
   * Get the log channel for a guild.
   * @param {Guild} guild The guild to get the log channel for.
   * @returns {Promise<?TextChannel>} The channel.
   * @private
   */
  async _getLog(guild) {
    const logChannel = await (db.table("mods").prop(guild.id || guild, "logs"));
    if (logChannel) {
      const returnVal = guild.channels.get(uncompress(logChannel));
      if (returnVal && returnVal.type === "text") {
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
    const logCase = await (db.table("mods").prop(guild.id, "latestCase"));
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
