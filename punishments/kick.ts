import { GuildMember, Message, RichEmbed, TextChannel, User } from "discord.js";
import { querystring } from "../util/deps";
import { escMarkdown, rejct, textAbstract } from "../util/funcs";
import { Punishment } from "./punishment";

class Kick extends Punishment {

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
  public async punish(
    member: GuildMember, reason?: string, auctPrefix?: string, reply?: (text: string) => any,
    send?: (text: string) => any, actionLog?: (...args: any[]) => any,
  ): Promise<void> {
    const guild = member.guild;
    const botmember = guild.me;
    reply = async (t: string) => reply ? reply(t) : null;
    const voidReply = (t: string) => void reply(t);
    send = async (t: string) => send ? send(t) : null;
    actionLog = (...args: any[]) => actionLog ? actionLog(...args) : null;
    if (member.highestRole.position > botmember.highestRole.position) {
      return voidReply("That member's highest role is higher in position than mine!");
    } else if (member.highestRole.position === botmember.highestRole.position) {
      return voidReply("That member's highest role is the same in position as mine!");
    } else if (member.highestRole.position > member.highestRole.position && member.id !== guild.owner.id) {
      return voidReply("That member's highest role is higher in position than yours!");
    } else if (member.highestRole.position === member.highestRole.position && member.id !== guild.owner.id) {
      return voidReply("That member's highest role is the same in position as yours!");
    } else if (member.id === guild.owner.id) {
      return voidReply("That member is the owner!");
    } else if (!member.kickable) {
      return voidReply("That member is not kickable (being generic here). \
  Check the conditions for being kicked (e.g. must not be owner, etc)!");
    }
    const sentKickMsg = await send(`Kicking ${member.user.tag}... (Sending DM...)`);
    const isMsg = sentKickMsg instanceof Message;
    const reasonEmbed = new RichEmbed();
    reasonEmbed
      .setColor("ORANGE")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finish = () => {
      if (isMsg) { sentKickMsg.edit(`Kicked ${member.user.tag} successfully.`).catch(rejct); }
      actionLog({
        action_desc: `**{target}** was kicked`,
        target: member,
        type: "kick",
        author: member,
        color: "ORANGE",
        reason: reason || "None",
      }).catch(rejct);
    };
    const fail = (err: any) => {
      rejct(err);
      if (isMsg) { sentKickMsg.edit(`The kick failed! :frowning:`).catch(rejct); }
    };
    const executeKick = () => {
      // const kickPrefix = origin ? `[Kick command executed by ${origin.tag}] ` : "";
      const compressedText = textAbstract(auctPrefix + " " + (reason || "No reason given"), 512);
      member.kick(querystring.escape(compressedText)).then(finish).catch(fail);
    };
  }
}
