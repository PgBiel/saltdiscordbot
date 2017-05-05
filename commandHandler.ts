import {
  Channel, Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, StringResolvable,
  TextChannel, User,
} from "discord.js";
import * as _ from "lodash";
import { CommandSetPerm } from "./classes/command";
import logger from "./classes/logger";
import perms from "./classes/permissions";
import Searcher from "./classes/searcher";
import funcs, { TextBasedChannel } from "./commandHandlerFuncs";
import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "./util/bot";
import { chalk, Constants } from "./util/deps";
import { cloneObject, rejct } from "./util/funcs";

export * from "./misc/contextType";

export * from "./commandHandlerFuncs";

const doError = logger.error;

export default async (msg: Message) => {
  const input: string = msg.content;
  const channel: TextBasedChannel = msg.channel;
  const message: Message = msg;
  const guildId: string = msg.guild ? msg.guild.id : null;

  const {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, doEval,
  } = funcs(msg);

  const context: {[prop: string]: any} = {
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    tag: `${msg.author.username}#${msg.author.discriminator}`,
    guild: msg.guild,

    reply, send, hasPermission, hasPermissions: hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    searcher: msg.guild ? new Searcher({ guild: msg.guild }) : null,
    checkRole, promptAmbig, userError, doEval,
  };
  const possiblePrefix: string = msg.guild ?
  ((await prefixes.findOne({ where: { serverid: msg.guild.id } })) as any).prefix || "+" :
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
      `^${_.escapeRegExp(cmd.name)}(?:\\s{1,4}[^]*)?$`, "i");
    if (!checkCommandRegex.test(instruction)) {
      continue;
    }
    if (guildId) {
      try {
        const disabled = await perms.isDisabled(guildId, channel.id, cmd.name);
        if (disabled) {
          return send(":lock: That command is disabled for this " + disabled + "!");
        }
      } catch (err) {
        logger.error(`At disable: ${err}`);
        return userError(`AT DISABLE`);
      }
    }

    const authorTag: string = subContext.authorTag = msg.author.tag;
    logger.custom( // log when someone does a command.
      `User ${chalk.cyan(authorTag)}, ${
        channel instanceof TextChannel ?
        `at channel ${chalk.cyan("#" + channel.name)} of ${chalk.cyan(msg.guild.name)}` :
        `in DMs with Salt`
      }, ran command ${chalk.cyan(cmd.name)}.`, "[CMD]", "magenta");

    if (cmd.perms && guildId) { // permission checking :)
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
    } else {
      subContext.perms = null;
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
      logger.error(`At Execution: ${err}`);
      return userError("AT EXECUTION");
    }
  }
};
