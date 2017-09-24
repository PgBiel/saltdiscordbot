import { GuildMember, Message, RichEmbed, Role, TextChannel, User } from "discord.js";
import { BaseContext, DjsChannel } from "../misc/contextType";
import { db, logger, Time } from "../util/deps";
import { createMutedRole, escMarkdown, rejct, textAbstract } from "../util/funcs";
import { Punishment } from "./punishment";

class Mute extends Punishment {

  /**
   * Mute someone.
   * @param {GuildMember} member The member that is being punished.
   * @param {Object} [options] Options to pass.
   * @param {GuildMember} [options.author] The author of the punishment.
   * @param {string} [options.reason] The reason of the punishment.
   * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
   * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
   * @param {Time} [options.time] For how long the member should be muted.
   * @param {boolean} [options.permanent] If the member is permanently muted.
   * @returns {Promise<void>}
   */
  public async punish(
    member: GuildMember, { author, reason, auctPrefix, context, time, permanent }: {
      author?: GuildMember, reason?: string, auctPrefix?: string, context?: BaseContext<DjsChannel | TextChannel>,
      time?: Time, permanent?: boolean,
    } = { author: null, reason: null, auctPrefix: null, context: null, time: new Time(["m", 10]), permanent: false },
  ): Promise<void> {
    const guild = member.guild;
    const botmember = guild.me;
    const def = (...args: any[]) => Promise.resolve(null);
    const { reply = def, send = def, actionLog = def } = context;
    if (!time) time = new Time(["m", 10]);
    const muteInfo = db.table("mutes").get(guild.id);
    let muteRole: Role;
    if (muteInfo) {
      muteRole = guild.roles.get(muteInfo.muteRoleID);
    }
    if (!muteRole) {
      try {
        const newRole = await createMutedRole(guild);
        db.table("mutes").assign(guild.id, { muteRoleID: newRole.id });
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
    if (muteRole.position > botmember.highestRole.position) {
      return void reply("The role used for muting has a higher position than my highest role!");
    } else if (muteRole.position === botmember.highestRole.position) {
      return void reply("The role used for muting is my highest role!");
    }
    const sentMuteMsg = await send(`Muting ${member.user.tag}... (Sending DM...)`);
    const reasonEmbed = new RichEmbed();
    reasonEmbed
      .setColor("GOLD")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finish = () => {
      sentMuteMsg.edit(
        `Muted ${member.user.tag} for **${time.toString()}** ${time ? "" : "(default) "}successfully.`,
      ).catch(rejct);
      actionLog({
        action_desc: `**{target}** was muted`,
        target: member,
        extraFields: [["Muted For", time]],
        type: "mute",
        author: member,
        color: "GOLD",
        reason: reason || "None",
      }).catch(rejct);
    };
    const fail = (err: any) => {
      rejct(err ? (err.err || err) : err);
      sentMuteMsg.edit(`The mute failed! :frowning:`).catch(rejct);
    };
    const executeMute = () => {
      const timestamp = new Time(Date.now())
        .add(time)
        .time.toString();
      db.table("activemutes").add(guild.id, {
        userid: member.id,
        timestamp,
        permanent: Boolean(permanent),
      }).then(() => {
        member.addRole(muteRole).then(finish).catch(fail);
      }).catch(fail);
    };
    let sent: boolean = false;
    let timeoutRan: boolean = false;
    member.send(
      `You were muted at the server **${escMarkdown(guild.name)}** for **${time}** for the reason of:`,
      { embed: reasonEmbed },
    ).then(() => {
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Sent. Adding role for muting...)`).catch(rejct);
      executeMute();
    }).catch((err) => {
      rejct(err);
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentMuteMsg.edit(`Muting ${member.user.tag}... (DM Failed. Adding role for muting anyway...)`).catch(rejct);
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

