import { Guild, GuildMember, Message, MessageEmbed, TextChannel, User } from "discord.js";
import { Time } from "ztimespan";
import { endChar, escMarkdown, rejct, rejctF, textAbstract } from "../funcs/funcs";
import Punishment from "./punishment";
import { Context } from "../misc/contextType";
import { ILogOption } from "../classes/actionlogger";
import { deprecate } from "util";

class Ban extends Punishment {

  /**
   * Ban someone.
   * @param {GuildMember|User|string} member The member/user/id that is being punished.
   * @param {Guild} guild The guild to punish the member at.
   * @param {BaseContext<GuildChannel>} context The context of the command.
   * @param {Object} [options] Options to pass.
   * @param {GuildMember} [options.author] The author of the punishment.
   * @param {string} [options.reason] The reason of the punishment.
   * @param {string} [options.auctPrefix] A prefix to be included on the audit logs.
   * @param {string[]} [options.actions] The terminology for the ban actions.
   * @param {boolean} [options.usePrompt] If prompt should be used.
   * @param {number} [options.days] The amount of days to ban for.
   * @param {boolean} [options.isSoft] If it is a soft ban or not.
   * @returns {Promise<void>}
   */
  public async punish(
    member: GuildMember | User | string, guild: Guild, context: Context,
    {
      author, reason, auctPrefix = "",
      actions = ["Banning", "Banned", "banned", "Ban", "ban"], usePrompt = true, days = 1, isSoft = false
    }: {
      author: GuildMember, reason?: string, auctPrefix?: string, actions?: [string, string, string, string, string],
      usePrompt?: boolean, days?: number, isSoft?: boolean,
    }
  ): Promise<void> {
    const id: string = typeof member === "string" ? member : null; // TODO: Merge +ban and +idban to use search()
    const user: User = member instanceof GuildMember ? member.user : (member instanceof User ? member : null);
    const botmember = guild.me;
    const def = (...args) => Promise.resolve<void>(null); // default func
    const { reply = def, send = def, actionLog = def, prompt } = context;
    if (author && member instanceof GuildMember) {
      let rply = "";
      if (member.roles.highest.position > botmember.roles.highest.position) {
        rply = "That member's highest role is higher in position than mine!";
      } else if (member.id === botmember.id) {
        rply = "I refuse to ban myself! :rage:";
      } else if (member.id === author.id) {
        rply = "Don't ban yourself! :frowning:";
      } else if (member.roles.highest.position === botmember.roles.highest.position) {
        rply = "That member's highest role is the same in position as mine!";
      } else if (member.roles.highest.position > author.roles.highest.position && author.id !== guild.ownerId) {
        rply = "That member's highest role is higher in position than yours!";
      } else if (member.roles.highest.position === author.roles.highest.position && author.id !== guild.ownerId) {
        rply = "That member's highest role is the same in position as yours!";
      } else if (member.id === guild.ownerId) {
        rply = "That member is the owner!";
      } else if (!member.bannable) {
        rply = "That member is not bannable (being generic here). \
Check the conditions for being banned (e.g. must not be owner, etc)!";
      }
      return void reply(rply);
    }

    if (usePrompt) {
      const embed = new MessageEmbed();
      embed
        .setAuthor({ name: `${actions[3]} confirmation - ${id || user.tag}`, iconURL: id ? undefined : user.displayAvatarURL() })
        .setColor("RED")
        .setDescription(reason || "No reason")
        .setTimestamp(new Date());
      const { res: result } = await prompt({
        question: `Are you sure you want to ${actions[4]} this ${id ? "user ID" : "member"}? \
This will expire in 15 seconds. Type __y__es or __n__o.`,
        invalidMsg: "__Y__es or __n__o?",
        filter: (msg2: Message) => {
          return /^(?:y(?:es)?)|(?:no?)$/i.test(msg2.content);
        },
        timeout: Time.seconds(15),
        cancel: false,
        options: { embeds: [embed] }
      });
      if (!result) {
        return;
      }
      if (/^n/i.test(result)) {
        send("Command cancelled.");
        return;
      }
    }
    const sentBanMsg: void | Message = await send(`${actions[0]} ${id || user.tag}... (${id ?
    "Swinging ban hammer..." :
    "Sending DM..."})`);
    const reasonEmbed = new MessageEmbed();
    reasonEmbed
      .setColor(isSoft ? "ORANGE" : "RED")
      .setDescription(reason || "None")
      .setTimestamp(new Date());
    const finishAsync = async (target: string | GuildMember | User) => {
      let targetToUse: typeof target;
      if (typeof target === "string") {
        if (sentBanMsg) sentBanMsg
          .edit(`${actions[0]} ${id || user.tag}... (${actions[1]} successfully. Fetching username...)`)
          .catch(rejctF("[BAN-FETCH USER-MSG]"));
        try {
          targetToUse = ((await guild.bans.fetch(target)) || { user: target }).user;
        } catch (err) {
          targetToUse = target;
        }
      } else {
        targetToUse = target;
      }
      const name: string = targetToUse instanceof GuildMember ?
        targetToUse.user.tag :
          targetToUse instanceof User ?
          targetToUse.tag :
          targetToUse;
      if (sentBanMsg) sentBanMsg.edit(`${actions[1]} ${name} successfully.`).catch(rejctF("[BAN-SUCCESSFUL-MSG]"));
      const userTarget: User = targetToUse instanceof GuildMember ? targetToUse.user : targetToUse as User;
      const logObj: ILogOption = {
        type: isSoft ? "s" : "b",
        author,
        reason: reason || "None",
        target: userTarget,
        guild
      };
      actionLog(logObj).catch(rejctF("[BAN-ACTIONLOG]"));
    };
    const finish = (target: string | GuildMember | User) => {
      finishAsync(target).catch(err => { throw err; });
    };
    const fail = err => {
      if (/Unknown ?User/i.test(err.toString()) && id) {
        if (sentBanMsg) sentBanMsg.edit(`A user with that ID does not exist!`).catch(rejctF("[BAN-NO ID-EDIT-MSG]"));
      } else {
        rejct(err, "[BAN-FAIL]");
        if (sentBanMsg) sentBanMsg.edit(`The ${actions[4]} failed! :frowning:`).catch(rejctF("[BAN-FAIL-EDIT MSG]"));
      }
    };
    const executeBan = () => {
      // const availableLength = 512 - (reason.length + banPrefix.length);
      const compressedText = textAbstract(endChar(auctPrefix) + (reason || "No reason given"), 512);
      guild.members.ban(
        member,
        { days: days == null ? 1 : days, reason: compressedText },
      ).then(result => {
          if (isSoft) {
            if (sentBanMsg) sentBanMsg.edit(`${actions[0]} ${user.tag}... (Waiting for unban...)`).catch(rejctF("[SOFTBAN-EDIT-MSG]"));
            guild.members.unban(user, "[Softban's Unban]").then(finish).catch(fail);
          } else {
            finish(result);
          }
      }).catch(fail);
    };
    let sent = false;
    let timeoutRan = false;
    if (typeof member !== "string") {
      member.send(
        { content: `You were ${actions[2]} at the server **${escMarkdown(guild.name)}** for the reason of:`, embeds: [reasonEmbed] },
      ).then(() => {
        if (timeoutRan) {
          return;
        }
        sent = true;
        if (sentBanMsg) sentBanMsg.edit(
          `${actions[0]} ${user.tag}... (DM Sent. Swinging ban hammer...)`,
        ).catch(rejctF("[BAN-DM SENT-EDIT-MSG]"));
        executeBan();
      }).catch(err => {
        rejct(err);
        if (timeoutRan) {
          return;
        }
        sent = true;
        if (sentBanMsg) sentBanMsg.edit(`${actions[0]} ${user.tag}... (DM Failed. Swinging ban hammer anyway...)`)
          .catch(rejctF("[BAN-DM FAIL-EDIT-MSG]"));
        executeBan();
      });
    } else {
      sent = true;
      executeBan();
    }
    setTimeout(() => {
      if (!sent) {
        timeoutRan = true;
        executeBan();
      }
    }, Time.seconds(2.8));
  }
}

export default new Ban();
