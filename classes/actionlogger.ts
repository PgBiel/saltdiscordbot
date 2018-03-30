import { ColorResolvable, Guild, GuildChannel, GuildMember, Message, MessageEmbed, TextChannel, User } from "discord.js";
// import { cases, moderation } from "../sequelize/sequelize";
import { bot, Constants, db, Interval, logger, moment, Time, util } from "../util/deps";
import {
  avatarCompress, avatarUncompress, cloneObject, compress, datecomp, dateuncomp, rejct, textAbstract, uncompress,
  durationcompress, durationdecompress
} from "../funcs/funcs";
import { HelperVals } from "../misc/tableValues";

type Case = HelperVals["punishments"];

/**
 * Options for editing a case.
 */
export interface ICaseEditOptions {
  /**
   * A new reason.
   * @type {string}
   */
  reason?: string;

  /**
   * New moderator ID.
   * @type {string}
   */
  moderator?: string;
  /**
   * To toggle thumbnail.
   * @type {string}
   */
  toggleThumbnail?: boolean;
}

/**
 * Options for action logging.
 */
export interface ILogOption {
  /**
   * Whatever is targeted by the action.
   * @type {User|GuildMember}
   */
  target: User | GuildMember;
  /**
   * ID of the target.
   * @type {?string}
   */
  targetId?: string;
  /**
   * A thumbnail.
   * @type {?string}
   */
  thumbnail?: string;
  /**
   * The type (i.e. punishment).
   */
  type: keyof typeof Constants.maps.PUNISHMENTS;
  /**
   * The author of the action.
   * @type {User|GuildMember}
   */
  author: User | GuildMember;
  /**
   * The reason that the action was done.
   * @type {?string}
   */
  reason?: string;
  /**
   * Guild the action was done at.
   * @type {Guild}
   */
  guild: Guild;
  /**
   * Time muted for, if any.
   * @type {?Interval}
   */
  time?: Interval;
}

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
  public async log(options: ILogOption): Promise<[Message, number]> {
    const {
      guild, author, reason, target, type,
      targetId, thumbnail, time
    } = options;
    const caseNum = Number(await this._getCase(guild)) || 0;
    // let time = new Time(1);
    const at = new Date();
    let thumbnailToUse: string;
    let idToUse: string;
    if (target instanceof GuildMember || target instanceof User) {
      const targetUser = target instanceof GuildMember ? target.user : target;
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
      thumbnail: avatarCompress(thumbnailToUse),
      messageid: undefined
    };
    const embed = await this.embedAction(caseObj);
    let msgSent: Message;
    try {
      const logChannel = await this._getLog(guild);
      const isOn = await (db.table("mods").prop((guild.id || guild) as string, "logsOn"));
      if (logChannel && (isOn || isOn == null)) {
        try {
          const semiMsgSent = await logChannel.send({ embed });
          if (Array.isArray(semiMsgSent)) {
            msgSent = semiMsgSent[0];
          } else {
            msgSent = semiMsgSent;
          }
        } catch (err) { rejct(err, "[ACTIONLOG-SENDLOG]"); }
      }
    } catch (err) {
      rejct(err);
      return null;
    }
    if (msgSent && msgSent.id) caseObj.messageid = compress(msgSent.id);
    db.table("punishments").add(guild.id, caseObj as Case);
    const maxCases = Constants.numbers.max.CASES(guild.members.size);
    if ((await (db.table("punishments").get(guild.id, []))).length > maxCases) {
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
  public async delCase(caseN: number, guild: Guild) {
    const cases = db.table("punishments");
    const caseToLook = (await cases.get(guild.id, [])).find(punish => punish.case === caseN);
    const obj = { case: false, message: false };
    if (!caseToLook) {
      return obj;
    }
    const newCaseToLook = cloneObject(caseToLook);
    newCaseToLook.deleted = true;
    try {
      const ind: number = await (db.table("punishments").indexOf(guild.id, caseToLook));
      await (db
        .table("punishments")
        .assign(guild.id, { [ind]: newCaseToLook }, true));
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
      // lol
    }
    return obj;
  }

  /**
   * Get a specific case.
   * @param {number} caseN The case number.
   * @param {Guild} guild The guild to look at.
   * @returns {Promise<object>} The result.
   */
  public async fetchCase(caseN: number, guild: Guild) {
    const cases = db.table("punishments");
    const caseToLook = (await cases.get(guild instanceof Guild ? guild.id : guild, []))
      .find(punish => punish.case === caseN);
    const obj: { case?: Case, embed?: MessageEmbed, message?: Message } = { case: null, embed: null, message: null };
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
  public async editCase(
    caseN: number,
    options: ICaseEditOptions,
    guild: Guild
  ) {
    const cases = db.table("punishments");
    const caseToLook: Case = (await cases.get(guild.id, [])).find(punish => punish.case === caseN);
    const obj: { case: boolean; message: boolean; resultCase?: Case; } = {
      case: false, message: false, resultCase: null
    };
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
      const ind = await (db.table("punishments").indexOf(guild.id, caseToLook));
      await (db
        .table("punishments")
        .assign(guild.id, { [ind]: newCaseToLook }, true));
      obj.case = true;
    } catch (err) {
      rejct(err);
      return obj;
    }
    if (caseToLook.type === "w" && (options.reason || options.moderator)) { // update the warns object too
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
      const logged: Message = await logChannel.messages.fetch(uncompress(caseToLook.messageid));
      const oldEmbed: MessageEmbed = logged.embeds[0];
      const newEmbed: MessageEmbed = await this.embedAction(newCaseToLook);
      await logged.edit({ embed: newEmbed });
      obj.message = true;
      return obj;
    } catch (err) {
      if (!/snowflake/i.test(util.inspect(err))) rejct(err, "[EDIT CASE LOG FETCH]");
      return obj;
    }
  }

  /**
   * Embed an action.
   * @param {object} [action] The action object.
   * @returns {MessageEmbed}
   */
  public async embedAction(
    action: Pick<
      Case,
      "case"|"target"|"time"|"moderator"|"reason"|"thumbnail"|"thumbOn"|"type"|"duration"
    >
  ) {
    const embed: MessageEmbed = new MessageEmbed();
    const {
      case: num, target, time, moderator, reason, thumbnail, thumbOn, type,
      duration: oDuration
    } = action || {} as never;
    const duration: string = oDuration ? String(new Interval(durationdecompress(oDuration))) : "0 seconds";
    const uncTarget = uncompress(target || compress("666"));
    const [, description, color, extraFields]: [any, string, string, string[][]] =
      Constants.maps.PUNISHMENTS[type as string] || [] as never;
    let text: string;
    try {
      const awaited = bot.users.get(uncTarget) || (await bot.users.fetch(uncTarget));
      text = awaited.tag;
    } catch (_err) {
      text = String(target || "Clyde");
    }
    const descToUse: string = (description || "Something happened to {target}").replace(/{target}/g, text || "Clyde");
    let numTime: Date;
    try {
      numTime = dateuncomp(time);
    } catch (err) {
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
    if (thumbOn) embed.setThumbnail(avatarUncompress(thumbnail, uncTarget) || (bot.user as any).defaultAvatarURL);
    embed.addField("Reason", reason || "None", false);
    return embed;
  }

  /**
   * Get the log channel for a guild.
   * @param {Guild} guild The guild to get the log channel for.
   * @returns {Promise<?TextChannel>} The channel.
   * @private
   */
  private async _getLog(guild: Guild): Promise<TextChannel> {
    const logChannel: string = await (db.table("mods").prop(guild.id, "logs"));
    if (logChannel) {
      const returnVal = guild.channels.get(uncompress(logChannel));
      if (returnVal instanceof TextChannel) {
        return returnVal;
      }
    }
    return null;
  }

  /**
   * Get the latest case for a guild.
   * @param {Guild} guild The guild to get the case for.
   * @returns {Promise<?umber>} The case number.
   * @private
   */
  private async _getCase(guild: Guild): Promise<number> {
    const logCase = await (db.table("mods").prop(guild.id, "latestCase"));
    if (logCase) {
      const returnVal = Number(logCase);
      if (!isNaN(returnVal)) {
        return returnVal;
      }
    }
    return 0;
  }
}
export default new ActionLog();
