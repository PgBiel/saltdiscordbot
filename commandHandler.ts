import {
  Channel, Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, TextChannel, User,
} from "discord.js";
import * as _ from "lodash";
import { CommandSetPerm } from "./classes/command";
import logger from "./classes/logger";
import perms from "./classes/permissions";
import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "./util/bot";
import { chalk } from "./util/deps";
import { cloneObject, rejct } from "./util/funcs";

export * from "./misc/contextType";

export type SaltRole = "moderator" | "mod" | "administrator" | "admin";
const doError = logger.error;

export type TextBasedChannel = DMChannel | TextChannel | GroupDMChannel;

interface ICustomSendType {
  autoCatch?: boolean;
}

export type ExtendedMsgOptions = MessageOptions & ICustomSendType;

export default async (msg: Message) => {
  const input: string = msg.content;
  const channel: TextBasedChannel = msg.channel;
  const message: Message = msg;
  const guildId: string = msg.guild ? msg.guild.id : null;

  const reply:
  (content: string, options?: ExtendedMsgOptions) => Promise<Message> =
  (content: string, options: ExtendedMsgOptions = {}) => {
    const result = msg.reply.bind(msg)(content, options);
    if (options.autoCatch == null || options.autoCatch) {
      result.catch(rejct);
    }
    return result;
  };
  const send:
  (content: string, options?: ExtendedMsgOptions) => Promise<Message> =
  (content: string, options: ExtendedMsgOptions = {}) => {
    const result = channel.send.bind(channel)(content, options);
    if (options.autoCatch == null || options.autoCatch) {
      result.catch(rejct);
    }
    return result;
  };
  const checkRole = async (role: SaltRole, member: GuildMember): Promise<boolean> => {
    if (["mod", "admin"].includes(role)) {
      role = role === "mod" ? "moderator" : "administrator";
    }
    if (!guildId) {
      return false;
    }
    const result: {[prop: string]: any} = await moderation.findOne({ where: { serverid: guildId } });
    if (!result || !result[role]) {
      return false;
    }
    if (member.roles && member.roles.get(result[role])) {
      return true;
    }
    return false;
  };
  const hasPermission = msg.member.hasPermission;

  const userError = (data: string) => reply(
    `Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);

  const context: {[prop: string]: any} = {
    input, channel, message, msg, guildId,

    reply, send, hasPermission, hasPermissions: hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    checkRole,
  };
  const possiblePrefix = msg.guild ?
  (await prefixes.findOne({ where: { serverid: msg.guild.id } })) as string || "+" :
  "+";
  for (const cmdn in bot.commands) {
    if (!bot.commands.hasOwnProperty(cmdn)) {
      continue;
    }
    const subContext = context;
    const cmd = bot.commands[cmdn];
    if (!cmd.name || !cmd.func) {
      continue;
    }
    let prefix: string;
    if (cmd.customPrefix) {
      prefix = cmd.customPrefix;
    } else {
      prefix = possiblePrefix;
    }
    if (cmd.guildOnly && !msg.guild) {
      continue;
    }
    subContext.prefix = prefix;
    const mentionfix: string = input.startsWith(`<@${bot.user.id}> `) ? `<@${bot.user.id}> ` : null;
    const usedPrefix: string = mentionfix || prefix || "+";
    if (!message.content.toUpperCase().startsWith(usedPrefix.toUpperCase())) {
      continue;
    }
    const instruction: string = subContext.instruction = input.replace(
      new RegExp(`^${_.escapeRegExp(usedPrefix)}`), "");

    const checkCommandRegex: RegExp = cmd.pattern || new RegExp(
      `^${_.escapeRegExp(cmd.name)}\s{0,4}$`);
    if (!checkCommandRegex.test(instruction)) {
      continue;
    }
    const authorTag: string = subContext.authorTag = `${msg.author.username}#${msg.author.discriminator}`;
    logger.custom( // log when someone does a command.
      `User ${chalk.cyan(authorTag)}, ${
        channel instanceof TextChannel ?
        `at channel ${chalk.cyan("#" + channel.name)} of ${chalk.cyan(msg.guild.name)}` :
        `in DMs with Salt`
      }, ran command ${chalk.cyan(cmd.name)}.`, "[CMD]", "magenta");

    try {
      const disabled = await perms.isDisabled(guildId, channel.id, cmd.name);
      if (disabled) {
        return send(":lock: That command is disabled for this " + disabled + "!");
      }
    } catch (err) {
      logger.error(`At disable: ${err}`);
      return userError(`AT DISABLE`);
    }

    if (cmd.perms) { // permission checking :)
      const permsToCheck: {[permission: string]: CommandSetPerm} = typeof cmd.perms === "string" ?
      {} :
      cloneObject(cmd.perms);
      if (typeof cmd.perms === "string") {
        permsToCheck[cmd.perms] = Boolean(cmd.default);
      }

      const parsedPerms = {};
      for (const permission in permsToCheck) {
        if (!permsToCheck.hasOwnProperty(permission)) {
          continue;
        }
        const isDefault = Boolean(permsToCheck[permission]);
        try {
          parsedPerms[permission] = Boolean(await perms.hasPerm(
            msg.member, guildId, permission, isDefault));
        } catch (err) {
          parsedPerms[permission] = false; // ¯\_(ツ)_/¯
          logger.custom(err, `[ERR/PERMCHECK]`, "red", "error");
        }
      }

      subContext.perms = parsedPerms;
    }

    const cmdRegex = new RegExp(`^${_.escapeRegExp(cmd.name)}\\s*`, "i");
    const args: string = subContext.args = instruction.replace(cmdRegex, "").length < 1 ? // arguments given...?
    null : // no
    instruction.replace(cmdRegex, ""); // yes
    subContext.arrArgs = args ? args.split(" ") : []; // array form of arguments.
    // and finally... we execute the command.
    try {
      const result = cmd.func(message, subContext);
      if (result instanceof Promise) {
        result.catch(rejct);
      }
    } catch (err) {
      return userError("AT EXECUTION");
    }
  }
};
