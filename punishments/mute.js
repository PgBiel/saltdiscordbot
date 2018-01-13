const { GuildMember, Message, MessageEmbed, Role, TextChannel, User } = require("discord.js");
const { db, moment, logger, Time, Interval } = require("../util/deps");
const {
  durationcompress, datecomp, createMutedRole, endChar, escMarkdown, rejct, textAbstract, durationuncompress,
  uncompress, compress
} = require("../util/funcs");
const Punishment = require("./punishment");

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
  async punish(
    member, {
      author = null, reason = null, auctPrefix = null, context = null, time = new Interval(["m", 10]), permanent = false } = {
      author: null, reason: null, auctPrefix: null, context: null, time: new Interval(["m", 10]), permanent: false },
  ) {
    const guild = member.guild;
    const botmember = guild.me;
    const def = (...args) => Promise.resolve(null);
    const { reply = def, send = def, actionLog = def } = context;
    if (!time) time = Interval.minutes(10);
    const muteInfo = db.table("mutes").get(guild.id);
    let muteRole;
    if (muteInfo) {
      muteRole = guild.roles.get(uncompress(muteInfo.muteRoleID));
    }
    if (!muteRole) {
      try {
        const newRole = await createMutedRole(guild);
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
    if (muteRole.position > botmember.highestRole.position) {
      return void reply("The role used for muting has a higher position than my highest role!");
    } else if (muteRole.position === botmember.highestRole.position) {
      return void reply("The role used for muting is my highest role!");
    }
    const sentMuteMsg = await send(`Muting ${member.user.tag}... (Sending DM...)`);
    const reasonEmbed = new MessageEmbed();
    reasonEmbed
      .setColor("GOLD")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finish = () => {
      sentMuteMsg.edit(
        `Muted ${member.user.tag} for **${time.toString()}** ${time ? "" : "(default) "}successfully.`,
      ).catch(rejct);
      actionLog({
        target: member,
        time,
        type: "m",
        author,
        reason: reason || "None"
      }).catch(rejct);
    };
    const fail = err => {
      rejct(err ? (err.err || err) : err);
      sentMuteMsg.edit(`The mute failed! :frowning:`).catch(rejct);
    };
    const executeMute = () => {
      const timestamp = moment().add(time);
      db.table("activemutes").add(guild.id, {
        userid: compress(member.id),
        timestamp: datecomp(timestamp.toDate()),
        permanent: Boolean(permanent)
      }).then(() => {
        const compressedText = textAbstract(endChar(auctPrefix) + (reason || "No reason given"), 512);
        member.addRole(muteRole, compressedText).then(finish).catch(fail);
      }).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
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
    }).catch(err => {
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

module.exports = new Mute();

