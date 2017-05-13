import { ColorResolvable, Guild, GuildChannel, GuildMember, Message, RichEmbed, TextChannel, User } from "discord.js";
import { cases, moderation } from "../sequelize/sequelize";
import { msgEmbedToRich, Time } from "../util/deps";
import { rejct } from "../util/funcs";

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
   * The type (i.e. punishment).
   */
  type: string;
  /**
   * The guild to log.
   * @type {Guild}
   */
  guild: Guild;
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
  extraFields?: [[string, string | Date | Time | number]];
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
  public async log(options: ILogOption): Promise<Message> {
    const { action_desc, guild, author, reason, color, extraFields, target, type } = options;
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
      embed.setThumbnail(targetUser.displayAvatarURL);
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
      const semiMsgSent = await (await this._getLog(guild)).send({ embed });
      if (Array.isArray(semiMsgSent)) {
        msgSent = semiMsgSent[0];
      } else {
        msgSent = semiMsgSent;
      }
    } catch (err) {
      rejct(err);
      return null;
    }
    cases.create({
      serverid: guild.id,
      type,
      moderator: author.id,
      case: caseNum,
      time: at.getTime(),
      reason: reason || "None",
      duration: time ? new Date(time.time) : null,
      messageid: msgSent.id,
    });
    return msgSent;
  }

  /**
   * Delete a case.
   * @param {number} caseN The case number.
   * @param {Guild} guild The guild to delete at.
   * @returns {Promise<boolean>} If it was deleted or not.
   */
  public async delCase(caseN: number, guild: Guild): Promise<boolean> {
    const caseToLook: {[prop: string]: any} = cases.find({ where: { case: caseN, serverid: guild.id } });
    if (!caseToLook) {
      return false;
    }
    try {
      const logged = await (await this._getLog(guild)).fetchMessage(caseToLook.messageid);
      logged.delete();
      caseToLook.destroy();
      return true;
    } catch (err) {
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
  public async editCase(reason: string, caseN: number, guild: Guild): Promise<boolean> {
    const caseToLook: {[prop: string]: any} = cases.find({ where: { case: caseN, serverid: guild.id } });
    if (!caseToLook) {
      return false;
    }
    try {
      const logged = await (await this._getLog(guild)).fetchMessage(caseToLook.messageid);
      const oldEmbed = logged.embeds[0];
      const newEmbed: RichEmbed = msgEmbedToRich(oldEmbed);
      newEmbed.fields.forEach((field, i) => {
        if (field.name === "Reason") {
          newEmbed.fields.splice(1, i);
        }
      });
      newEmbed.addField("Reason", reason, false);
      logged.edit({ embed: newEmbed });
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
      if (returnVal) {
        return returnVal;
      }
    }
    return null;
  }
}
export default ActionLog;
