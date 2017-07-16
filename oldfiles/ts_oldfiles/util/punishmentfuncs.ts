import { ColorResolvable, GuildMember, Message, RichEmbed, User } from "discord.js";
import { TContext } from "../commandHandler";
import { querystring, Time } from "./deps";
import { escMarkdown, rejct, textAbstract } from "./funcs";

interface IFinishBanOptions {
  getUser: (user?: GuildMember | User) => User;
  id: string;
  reason: string;
}

interface IFinishMuteOptions {
  time: Time;
  reason: string;
}

export interface IPunishActs {
  initial: string;
  dmFail: string;
  dmOk: string;
}

export interface IPunishOptions {
  id?: string;
  memberToUse: GuildMember | User;
  reason?: string;
  finish?: ((...args: any[]) => any) | ((target: GuildMember | User | string, ...args: any[]) => any);
  escape?: boolean;
  color?: ColorResolvable;
  extraFields?: [[string, Time | Date | string]];
  suggestedPunish?: "kick" | "ban" | "mute";
  time?: Time;
}

/**
 * Execute a punishment.
 * @param {Function} punish The punishing action.
 * @param {string[]} punishActions The punish action strings. E.g.: ["banning", "banned", "ban"].
 * @param {Object} messages The messages, e.g. {initial: "Banning user"}.
 * @param {Object} context The context.
 * @param {Object} options Other options.
 * @returns {Promise<void>}
 */
async function punishment(
  punish: (member: GuildMember, ...args: any[]) => any, punishActions: [string, string, string],
  messages: IPunishActs, context: TContext, options: IPunishOptions,
): Promise<void> {
  const actions: string[] = [];
  punishActions.forEach((el: string) => {
    actions.push(el[0].toLowerCase() + el.slice(1));
    actions.push(el[0].toUpperCase() + el.slice(1));
  });
  const {
    memberToUse, id, reason = null,
    escape, suggestedPunish,
  } = options;
  const getUser = (user: GuildMember | User = memberToUse): User => user instanceof GuildMember ? user.user : user;
  const {
    guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
    searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  } = context;
  const sentPunishMsg = await send(`${actions[0]} ${id || getUser().tag}... (${id ?
    messages.initial || "Executing action..." :
    "Sending DM..."})`);
  const reasonEmbed = new RichEmbed();
  reasonEmbed
    .setColor(options.color || dummy.color || "RED")
    .setDescription(reason || "None")
    .setTimestamp(new Date());
  // finishes
  // end of finish ban
  const finishOther = (target: GuildMember | User | string) => {
    const theObj = {
      action_desc: `**{target}** was ${actions[2]}`,
      target: memberToUse,
      type: actions[4],
      author: member,
      color: options.color || dummy.color || "RED",
      reason: reason || "None",
      extraFields: undefined,
    };
    if (suggestedPunish === "kick") {
      sentPunishMsg.edit(`Kicked ${getUser().tag} successfully.`).catch(rejct);
    }
    actionLog(theObj).catch(rejct);
  };
  const fail = (err: any) => {
    if (/Unknown ?User/i.test(err.toString()) && id) {
      sentPunishMsg.edit(`An user with that ID does not exist!`).catch(rejct);
    } else {
      rejct(err);
      sentPunishMsg.edit(`The ${actions[4]} failed! :frowning:`).catch(rejct);
    }
  };
  const execute = () => {
    const reasonPrefix = `[${actions[3]} command executed by ${author.tag}] `;
    // const availableLength = 512 - (reason.length + banPrefix.length);
    const preCompressedText = textAbstract(reasonPrefix + (reason || "No reason given"), 512);
    const compressedText = escape ? querystring.escape(preCompressedText) : preCompressedText;
    if (suggestedPunish) {
      if (suggestedPunish === "ban") {
        guild.ban(
          id || memberToUse,
          { days: dummy.days == null ? 1 : dummy.days, reason: compressedText })
        .then((result) => {
            if (dummy.banType === "softban") {
              sentPunishMsg.edit(`${actions[0]} ${getUser().tag}... (Waiting for unban...)`).catch(rejct);
              guild.unban(getUser()).then((t) => {
                finishBan(context, t, actions, sentPunishMsg, { getUser, id, reason });
              }).catch(fail);
            } else {
              finishBan(context, result, actions, sentPunishMsg, { getUser, id, reason });
            }
        }).catch(fail);
      } else if (suggestedPunish === "kick") {
        if (memberToUse instanceof GuildMember) {
          memberToUse.kick(querystring.escape(compressedText)).then(finishOther).catch(fail);
        } else {
          fail(new TypeError("Member is not GuildMember."));
        }
      }
    }
  };
  let sent: boolean = false;
  let timeoutRan: boolean = false;
  if (!id) {
    memberToUse.send(
      `You were ${actions[2]} at the server **${escMarkdown(guild.name)}** for the reason of:`,
      { embed: reasonEmbed },
    ).then(() => {
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentPunishMsg.edit(
        `${actions[0]} ${getUser().tag}... (DM Sent. ${messages.dmOk}...)`,
      ).catch(rejct);
      execute();
    }).catch((err) => {
      rejct(err);
      if (timeoutRan) {
        return;
      }
      sent = true;
      sentPunishMsg.edit(`${actions[0]} ${getUser().tag}... (DM Failed. ${messages.dmFail}...)`).catch(rejct);
      execute();
    });
  } else {
    sent = true;
    execute();
  }
  setTimeout(() => {
    if (!sent) {
      timeoutRan = true;
      execute();
    }
  }, Time.seconds(2.8));
}

function finishMute(
  context: TContext, theTarget: GuildMember | User | string, sentMuteMsg: Message,
  reason: string,
): void {
  const {
    guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
    searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  } = context;
}

/**
 * The finish version for ban.
 * @param {TContext} context The context.
 * @param {GuildMember|User|string} theTarget Target of the ban.
 * @param {string[]} actions The actions.
 * @param {Message} sentBanMsg The message to edit.
 * @param {IFinishBanOptions} options Other options.
 * @returns {void}
 */
function finishBan(
  context: TContext, theTarget: GuildMember | User | string, actions: string[],
  sentBanMsg: Message, options: IFinishBanOptions,
): void {
  const { getUser, id, reason } = options;
  const {
    guildId, guild, reply, send, args, prompt, prefix, hasPermission, perms,
    searcher, promptAmbig, author, botmember, member, actionLog, dummy,
  } = context;
  const finishAsync = async (target: GuildMember | User | string) => {
    let targetToUse: typeof target;
    if (typeof target === "string") {
      sentBanMsg
      .edit(`${actions[0]} ${id || getUser().tag}... (Banned successfully. Fetching username...)`)
      .catch(rejct);
      try {
        const bans = await guild.fetchBans();
        targetToUse = bans.get(target) || target;
      } catch (err) {
        targetToUse = target;
      }
    } else {
      targetToUse = target;
    }
    const name = targetToUse instanceof GuildMember ?
      targetToUse.user.tag :
      targetToUse instanceof User ?
      targetToUse.tag :
      targetToUse;
    sentBanMsg.edit(`${actions[1]} ${name} successfully.`).catch(rejct);
    const userTarget = targetToUse instanceof GuildMember ? targetToUse.user : targetToUse;
    const logObj = {
      action_desc: `**{target}** was ${actions[2]}`,
      type: actions[3],
      author: member,
      color: dummy.color || "RED",
      reason: reason || "None",
      target: userTarget,
    };
    actionLog(logObj).catch(rejct);
  };
  finishAsync(theTarget).catch((err: any) => { throw err; });
}
