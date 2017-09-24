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
// import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "./util/bot";
import { chalk, conn, Constants, db } from "./util/deps";
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
    send, reply, doEval, prompt, actionLog,
  } = funcs(msg);

  const context: {[prop: string]: any} = {
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    tag: `${msg.author.username}#${msg.author.discriminator}`,
    guild: msg.guild, dummy: {},

    reply, send, hasPermission, hasPermissions: hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    searcher: msg.guild ? new Searcher<GuildMember>({ guild: msg.guild }) : null,
    checkRole, promptAmbig, userError, doEval, prompt, actionLog,
  };
  const dbPrefix = msg.guild ? db.table("prefixes").get(guildId) : null;
  const possiblePrefix: string = dbPrefix || "+";
  for (const cmdn in bot.commands) {
    if (!bot.commands.hasOwnProperty(cmdn)) {
      continue;
    }
    const subContext = cloneObject(context);
    subContext.dummy = {};
    const cmd = bot.commands[cmdn];
    const descCmd = cmd.aliasData && cmd.aliasData.__aliasOf ? cmd.aliasData.__aliasOf : cmd;
    if (!cmd.name || !descCmd.func) {
      continue;
    }
    let prefix: string;
    if (cmd.aliasData) {
      for (const key in cmd.aliasData) {
        if (!cmd.aliasData.hasOwnProperty(key)) {
          continue;
        }
        subContext.dummy[key] = cmd.aliasData[key];
      }
    }
    if (descCmd.customPrefix) {
      prefix = descCmd.customPrefix;
    } else {
      prefix = possiblePrefix;
    }
    if (descCmd.guildOnly && !msg.guild) {
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
    if (guildId && cmd.name !== "eval") {
      try {
        const disabled = perms.isDisabled(guildId, channel.id, cmd.name);
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
      }, ran command ${chalk.cyan(cmd.name)}.`, { prefix: "[CMD]", color: "magenta" });

    if (cmd.perms && guildId) { // permission checking :)
      const permsToCheck: {[permission: string]: CommandSetPerm} = typeof cmd.perms === "string" ?
      {} :
      cloneObject(cmd.perms);
      if (typeof cmd.perms === "string") {
        permsToCheck[cmd.perms] = Boolean(cmd.default);
      }

      const parsedPerms = {};
      const setPerms = {};
      for (const permission in permsToCheck) {
        if (!permsToCheck.hasOwnProperty(permission)) {
          continue;
        }
        const isDefault = Boolean(permsToCheck[permission]);
        try {
          const permsResult = perms.hasPerm(msg.member, guildId, permission, isDefault);
          parsedPerms[permission] = Boolean(permsResult.hasPerm);
          setPerms[permission] = Boolean(permsResult.setPerm);
        } catch (err) {
          parsedPerms[permission] = false; // ¯\_(ツ)_/¯
          setPerms[permission] = false;
          logger.custom(err, { prefix: `[ERR/PERMCHECK]`, color: "red", type: "error" });
        }
      }

      subContext.perms = parsedPerms;
      subContext.setPerms = setPerms;
    } else {
      subContext.perms = null;
      subContext.setPerms = null;
    }

    const cmdRegex = new RegExp(`^${_.escapeRegExp(cmd.name)}\\s*`, "i");
    const args: string = subContext.args = instruction.replace(cmdRegex, "").length < 1 ? // arguments given...?
    null : // no
    instruction.replace(cmdRegex, ""); // yes
    subContext.arrArgs = args ? args.split(" ") : []; // array form of arguments.
    subContext.self = subContext; // The context itself.
    // and finally... we execute the command.
    try {
      const result = await descCmd.func(message, subContext);
    } catch (err) {
      logger.error(`At Execution: ${err}`);
      return userError("AT EXECUTION");
    }
    break;
  }
};
