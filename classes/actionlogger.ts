import { ColorResolvable, Guild, GuildChannel, GuildMember, Message, RichEmbed, TextChannel, User } from "discord.js";
import { cases, moderation } from "../sequelize/sequelize";
import { logger, msgEmbedToRich, Sequelize, Time } from "../util/deps";
import { rejct } from "../util/funcs";

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
   * Describes the action. Replaces {target} by action target
   * @type {string}
   */
  action_desc: string;
  /**
   * Whatever is targeted by the action.
   * @type {*}
   */
  target: any;
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
  type: string;
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
   * The color to use.
   * @type {ColorResolvable}
   */
  color: ColorResolvable;
  /**
   * Any extra fields that appear next to the author field.
   * @type {?Array<Array<string, string | Date | Time | number>>}
   */
  extraFields?: Array<[string, string | Date | Time | number]>;
}

/**
 * Main class for action logging.
 */
class ActionLog {
  /**
   * Log an action.
   * @param {LogOptions} options The options.
   * @returns {Promise<?Message>} The sent message.
   */
  public async log(options: ILogOption & { guild: Guild }): Promise<Message> {
    const {
      action_desc, guild, author, reason, color, extraFields, target, type,
      targetId, thumbnail,
    } = options;
    const logChannel = await this._getLog(guild);
    if (!logChannel) {
      return null;
    }
    const authorToUse: string = typeof author === "string" ?
    author :
    `<@${author.id}>`;
    let targetString;
    try {
      targetString = target.toString();
    } catch (err) {
      targetString = String(target);
    }
    const descToUse: string = action_desc.replace(
      /{target}/g, target instanceof GuildMember ?
      target.user.username :
      target instanceof User ?
        target.username :
        targetString);
    const embed: RichEmbed = new RichEmbed();
    const caseNum: string | number = await this._getCase(guild);
    if (typeof caseNum === "string" || isNaN(caseNum) || caseNum == null) {
      return;
    }
    let time: Time = new Time(1);
    const at = new Date();
    embed
      .setTitle(`Action Log ${caseNum + 1}`)
      .setDescription(descToUse)
      .setColor(color)
      .setTimestamp(at)
      .addField("Author", authorToUse, true);
    if (target instanceof GuildMember || target instanceof User) {
      const targetUser = target instanceof GuildMember ? target.user : target;
      embed
        .setThumbnail(targetUser.displayAvatarURL)
        .setFooter(`Target Member's ID: ${targetUser.id}`);
    } else {
      embed
        .setThumbnail(thumbnail)
        .setFooter(`Target Member's ID: ${targetId}`);
    }
    if (extraFields) {
      for (const field of extraFields) {
        embed.addField(field[0], field[1], true);
        for (const val of field) {
          const possibleDate = field[1];
          if (
            typeof val === "string"
            && /for/i.test(val)
            && (possibleDate instanceof Date || possibleDate instanceof Time)
          ) {
            time = possibleDate instanceof Date ? new Time(possibleDate) : possibleDate;
            const obj: {[prop: string]: any} = {time};
            console.log(obj.time);
            break;
          }
        }
      }
    }
    embed.addField("Reason", reason, false);
    let msgSent: Message;
    try {
      const semiMsgSent = await logChannel.send({ embed });
      if (Array.isArray(semiMsgSent)) {
        msgSent = semiMsgSent[0];
      } else {
        msgSent = semiMsgSent;
      }
    } catch (err) {
      rejct(err);
      return null;
    }
    const caseObj: {[prop: string]: any} = {
      serverid: guild.id,
      type,
      moderator: author.id,
      case: caseNum + 1,
      time: at.getTime(),
      reason: reason || "None",
      duration: time ? time.time : null,
      messageid: msgSent.id,
    };
    if (embed.thumbnail) {
      caseObj.thumbnail = embed.thumbnail.url;
    }
    cases.create(caseObj).catch(rejct);
    try {
      const entry: {[prop: string]: any} = await moderation.findOne({ where: { serverid: guild.id } });
      entry.update({
        latestCase: caseNum + 1,
      }).catch(rejct);
    } catch (err) {
      logger.error(`At updating moderation entry (Case num: ${caseNum}, guild: ${guild.id}): ${err}`);
    }
    return msgSent;
  }

  /**
   * Delete a case.
   * @param {number} caseN The case number.
   * @param {Guild} guild The guild to delete at.
   * @returns {Promise<boolean>} If it was deleted or not.
   */
  public async delCase(caseN: number, guild: Guild): Promise<boolean> {
    const caseToLook: {[prop: string]: any} = await cases.find({ where: { case: caseN, serverid: guild.id } });
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
    } catch (err) {
      return false;
    }
  }

  /**
   * Edit a case.
   * @param {number} caseN The case number.
   * @param {Object} options The options.
   * @param {string} [options.reason] The reason to set.
   * @param {boolean} [options.toggleThumbnail] If it should toggle thumbnail.
   * @param {Guild} guild The guild to edit at.
   * @returns {Promise<boolean>} If it was edited or not.
   */
  public async editCase(caseN: number, options: ICaseEditOptions, guild: Guild): Promise<boolean> {
    const caseToLook: {[prop: string]: any} = await cases.find({ where: { case: caseN, serverid: guild.id } });
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
      const newEmbed: RichEmbed = msgEmbedToRich(oldEmbed);
      if (options.reason) {
        newEmbed.fields.forEach((field, i) => {
          if (field.name === "Reason") {
            newEmbed.fields.splice(1, i);
          }
        });
        newEmbed.addField("Reason", options.reason, false);
      }
      if (options.toggleThumbnail) {
        if (newEmbed.thumbnail) {
          newEmbed.thumbnail = null;
        } else {
          newEmbed.setThumbnail(caseToLook.thumbnail);
        }
      }
      await logged.edit({ embed: newEmbed });
      return true;
    } catch (err) {
      rejct(err);
      return false;
    }
  }

  /**
   * Get the log channel for a guild.
   * @param {Guild} guild The guild to get the log channel for.
   * @returns {Promise<?TextChannel>} The channel.
   * @private
   */
  private async _getLog(guild: Guild): Promise<TextChannel> {
    const logChannel: {[prop: string]: any} = await moderation.findOne({ where: { serverid: guild.id } });
    if (logChannel) {
      const returnVal = guild.channels.get(logChannel.logs);
      if (returnVal && returnVal instanceof TextChannel) {
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
  private async _getCase(guild: Guild): Promise<string | number> {
    const logCase: {[prop: string]: any} = await moderation.findOne({ where: { serverid: guild.id } });
    if (logCase) {
      const returnVal = isNaN(logCase.latestCase) ? logCase.latestCase : Number(logCase.latestCase);
      if (typeof returnVal === "string" || typeof returnVal === "number") {
        return returnVal;
      }
    }
    return null;
  }
}
export default new ActionLog();
