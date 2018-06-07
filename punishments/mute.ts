import { GuildMember, Message, MessageEmbed, Role, TextChannel, User } from "discord.js";
import { db, moment, logger, Time, Interval } from "../util/deps";
import {
  durationcompress, datecomp, createMutedRole, endChar, escMarkdown, rejct, textAbstract, durationdecompress,
  uncompress, compress, rejctF
} from "../funcs/funcs";
import Punishment from "./punishment";
import { Context } from "../misc/contextType";

class Mute extends Punishment {

  /**
   * Mute someone.
   * @param {GuildMember} member The member that is being punished.
   * @param {Object} [options] Options to pass.
   * @param {GuildMember} [options.author] The author of the punishment.
   * @param {string} [options.reason] The reason of the punishment.
   * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
   * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
   * @param {Interval} [options.time] For how long the member should be muted.
   * @param {boolean} [options.permanent] If the member is permanently muted.
   * @returns {Promise<void>}
   */
  public async punish(
    member: GuildMember, { author, reason, auctPrefix, context, time, permanent }: {
      author?: GuildMember, reason?: string, auctPrefix?: string, context?: Context,
      time?: Interval, permanent?: boolean,
    } = { author: null, reason: null, auctPrefix: null, context: null, time: Interval.minutes(10), permanent: false }
  ): Promise<void> {
    const guild = member.guild;
    const botmember: GuildMember = guild.me;
    const def = (...args) => Promise.resolve(null);
    const { reply = def as never, send = def as never, actionLog = def as never } = context;
    if (!time && !permanent) time = Interval.minutes(10);
    const muteInfo = await (db.table("mutes").get(guild.id));
    let muteRole: Role; // role to give on mute
    if (muteInfo) {
      muteRole = guild.roles.get(uncompress(muteInfo.muteRoleID));
    }
    if (!muteRole) { // no mute role :(, must create
      try {
        const newRole: Role = await createMutedRole(guild);
        db.table("mutes").assign(guild.id, { muteRoleID: compress(newRole.id) });
        muteRole = newRole;
      } catch (err) {
        logger.error(`At making mute role: ${err}`);
        return void reply("I attempted to create role for muting, but I couldn't! :frowning:");
      }
    }
    /* if (memberToUse.id === guild.owner.id) {
      return reply("That user is the owner, so muting would have no effect!");
    } else if (memberToUse.hasPermission(["ADMINISTRATOR"])) {
      return reply("That user has `Administrator` permissions, so muting would have no effect!");
    } else */
    if (muteRole.position > botmember.roles.highest.position) {
      return void reply("The role used for muting has a higher position than my highest role!");
    } else if (muteRole.position === botmember.roles.highest.position) {
      return void reply("The role used for muting is my highest role!");
    }
    const sentMuteMsg: Message = await send(`Muting ${member.user.tag}... (Sending DM...)`);
    const reasonEmbed: MessageEmbed = new MessageEmbed();
    reasonEmbed
      .setColor("GOLD")
      .setDescription(reason || "None")
      .setTimestamp(new Date());

    const finish = () => {
      sentMuteMsg.edit(
        permanent ?
        `Permanently muted ${member.user.tag} successfully.` :
        `Muted ${member.user.tag} for **${time}** ${time ? "" : "(default) "}successfully.`,
      ).catch(rejctF("[MUTE-SUCCESSFUL-EDIT-MSG]"));
      actionLog({
        target: member,
        time,
        guild: member.guild,
        type: permanent ? "p" : "m",
        author,
        reason: reason || "None"
      }).catch(rejctF("[MUTE-ACTIONLOG]"));
    };
    const fail = err => {
      rejct(err ? (err.err || err) : err);
      sentMuteMsg.edit(`The mute failed! :frowning:`).catch(rejctF("[MUTE-FAIL-EDIT-MSG]"));
    };

    const executeMute = () => {
      let timestamp;
      if (!permanent) timestamp = moment().add(time.duration);
      db.table("activemutes").add(guild.id, {
        userid: compress(member.id),
        timestamp: timestamp ? datecomp(timestamp.toDate()) : null,
        permanent: Boolean(permanent)
      }).then(() => {
        const compressedText: string = textAbstract(endChar(auctPrefix) + (reason || "No reason given"), 512);
        member.roles.add(muteRole, compressedText).then(finish).catch(fail);
      }).catch(fail);
    };

    let sent: boolean = false;
    let timeoutRan: boolean = false;
    member.send(
      `You were muted at the server **${escMarkdown(guild.name)}** ${permanent ?
        "permanently" :
        `for **${time}**`} for the reason of:`,
      { embed: reasonEmbed },
    ).then(() => {
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Sent. Adding role for muting...)`)
        .catch(rejctF("[MUTE-DM SENT-EDIT-MSG]"));
      executeMute();
    }).catch(err => {
      rejct(err);
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Failed. Adding role for muting anyway...)`)
        .catch(rejctF("[MUTE-DM FAIL-EDIT-MSG]"));
      executeMute();
    });
    setTimeout(() => {
      if (!sent) {
        timeoutRan = true;
        executeMute();
      }
    }, Time.seconds(2.8));
  }
}

export default new Mute();
