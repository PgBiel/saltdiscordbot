import { GuildMember, Message, RichEmbed, TextChannel, User } from "discord.js";
import { BaseContext, DjsChannel } from "../misc/contextType";
import { querystring, Time } from "../util/deps";
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
    member: GuildMember, author?: GuildMember, reason?: string, auctPrefix?: string,
    context?: BaseContext<DjsChannel | TextChannel>,
  ): Promise<void> {
    const guild = member.guild;
    const botmember = guild.me;
    const def = (...args: any[]) => null;
    const { reply = def, send = def, actionLog = def } = context;
    if (author) {
      if (member.highestRole.position > botmember.highestRole.position) {
        return void reply("That member's highest role is higher in position than mine!");
      } else if (member.highestRole.position === botmember.highestRole.position) {
        return void reply("That member's highest role is the same in position as mine!");
      } else if (member.highestRole.position > author.highestRole.position && author.id !== guild.owner.id) {
        return void reply("That member's highest role is higher in position than yours!");
      } else if (member.highestRole.position === author.highestRole.position && author.id !== guild.owner.id) {
        return void reply("That member's highest role is the same in position as yours!");
      } else if (member.id === guild.owner.id) {
        return void reply("That member is the owner!");
      } else if (!member.kickable) {
        return void reply("That member is not kickable (being generic here). \
    Check the conditions for being kicked (e.g. must not be owner, etc)!");
      }
    }
    const sentKickMsg = await send(`Kicking ${member.user.tag}... (Sending DM...)`);
    const edit = (text: string) => sentKickMsg instanceof Message ? sentKickMsg.edit(text) : Promise.resolve(null);
    const reasonEmbed = new RichEmbed();
    reasonEmbed
      .setColor("ORANGE")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finish = () => {
      edit(`Kicked ${member.user.tag} successfully.`).catch(rejct);
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
      edit(`The kick failed! :frowning:`).catch(rejct);
    };
    const executeKick = () => {
      // const kickPrefix = origin ? `[Kick command executed by ${origin.tag}] ` : "";
      const compressedText = textAbstract(auctPrefix + " " + (reason || "No reason given"), 512);
      member.kick(querystring.escape(compressedText)).then(finish).catch(fail);
    };
    let sent: boolean = false;
    let timeoutRan: boolean = false;
    const escapedName: string = escMarkdown(guild.name);
    member.send(`You were kicked at the server **${escapedName}** for the reason of:`, { embed: reasonEmbed })
      .then(() => {
        if (timeoutRan) {
          return;
        }
        sent = true;
        edit(`Kicking ${member.user.tag}... (DM Sent. Kicking...)`).catch(rejct);
        executeKick();
      }).catch((err) => {
        rejct(err);
        if (timeoutRan) {
          return;
        }
        sent = true;
        edit(`Kicking ${member.user.tag}... (DM Failed. Kicking anyway...)`);
        executeKick();
      });
    setTimeout(() => {
      if (!sent) {
        timeoutRan = true;
        executeKick();
      }
    }, Time.seconds(2.8));
  }
}

export default new Kick();
