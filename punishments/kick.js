const { GuildMember, Message, MessageEmbed, TextChannel, User } = require("discord.js");
const { Time } = require("../util/deps");
const { escMarkdown, rejct, textAbstract } = require("../util/funcs");
const Punishment = require("./punishment");

class Kick extends Punishment {

  /**
   * Kick someone.
   * @param {GuildMember} member The member that is being punished.
   * @param {Object} [options] Options to pass.
   * @param {GuildMember} [options.author] The author of the punishment.
   * @param {string} [options.reason] The reason of the punishment.
   * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
   * @param {BaseContext<GuildChannel>} [options.context] The context of the command.
   * @returns {Promise<void>}
   */
  async punish(
    member, { author, reason, auctPrefix, context } = { author: null, reason: null, auctPrefix: null, context: null },
  ) {
    const guild = member.guild;
    const botmember = guild.me;
    const def = (...args) => Promise.resolve(null);
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
    const edit = text => sentKickMsg instanceof Message ? sentKickMsg.edit(text) : Promise.resolve(null);
    const reasonEmbed = new MessageEmbed();
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
    const fail = err => {
      rejct(err);
      edit(`The kick failed! :frowning:`).catch(rejct);
    };
    const executeKick = () => {
      // const kickPrefix = origin ? `[Kick command executed by ${origin.tag}] ` : "";
      const compressedText = textAbstract(auctPrefix + " " + (reason || "No reason given"), 512);
      member.kick(compressedText).then(finish).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    const escapedName = escMarkdown(guild.name);
    member.send(`You were kicked at the server **${escapedName}** for the reason of:`, { embed: reasonEmbed })
      .then(() => {
        if (timeoutRan) {
          return;
        }
        sent = true;
        edit(`Kicking ${member.user.tag}... (DM Sent. Kicking...)`).catch(rejct);
        executeKick();
      }).catch(err => {
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

module.exports = new Kick();
