const {
  Channel, Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, StringResolvable,
  TextChannel, User,
} = require("discord.js");
const _ = require("lodash");
const { CommandSetPerm } = require("./classes/command");
const logger = require("./classes/logger");
const perms = require("./classes/permissions");
const Searcher = require("./classes/searcher");
const funcs = require("./commandHandlerFuncs");
// const { moderation, prefixes } = require("./sequelize/sequelize");
const { bot } = require("./util/bot");
const { chalk, conn, Constants, db } = require("./util/deps");
const { cloneObject, rejct } = require("./util/funcs");

/* export * from "./misc/contextType";

export * from "./commandHandlerFuncs"; */

const doError = logger.error;

module.exports = async msg => {
  // initialize some vars
  const input = msg.content;
  const channel = msg.channel;
  const message = msg;
  const guildId = msg.guild ? msg.guild.id : null;

  const {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, doEval, prompt, actionLog,
  } = funcs(msg);

  const context = {
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    tag: `${msg.author.username}#${msg.author.discriminator}`,
    guild: msg.guild, dummy: {},

    reply, send, hasPermission, hasPermissions: hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    searcher: msg.guild ? new Searcher({ guild: msg.guild }) : null,
    checkRole, promptAmbig, userError, doEval, prompt, actionLog,
  };
  // fetch prefix from db
  const dbPrefix = msg.guild ? db.table("prefixes").get(guildId) : null;
  const possiblePrefix = dbPrefix || "+";
  // loop commands to find a match
  for (const cmdn in bot.commands) {
    // safety thing
    if (!bot.commands.hasOwnProperty(cmdn)) {
      continue;
    }
    // make our own copy of context to modify safely (otherwise it would repeat for all tests)
    const subContext = cloneObject(context);
    subContext.dummy = {};
    const cmd = bot.commands[cmdn];
    const descCmd = cmd.aliasData && cmd.aliasData.__aliasOf ? cmd.aliasData.__aliasOf : cmd;
    // if the command doesn't exist or doesn't do anything... Ignore it
    if (!cmd.name || !descCmd.func) {
      continue;
    }
    let prefix;
    // aliasData is data to be given for aliases, e.g. do this operation instead of the other.
    if (cmd.aliasData) {
      for (const key in cmd.aliasData) {
        if (!cmd.aliasData.hasOwnProperty(key)) {
          continue;
        }
        subContext.dummy[key] = cmd.aliasData[key];
      }
    }
    // if the command has a required prefix (instead of the configurable one) then use it, otherwise the configurable one
    if (descCmd.customPrefix) {
      prefix = descCmd.customPrefix;
    } else {
      prefix = possiblePrefix;
    }
    // if the command is only for guilds and we aren't in one, then skip
    if (descCmd.guildOnly && !msg.guild) {
      continue;
    }
    subContext.prefix = prefix;
    // check if bot was summoned with mention...
    const mentionfix = input.startsWith(`<@${bot.user.id}> `) ? `<@${bot.user.id}> ` : null;
    // ...then really determine the prefix used.
    const usedPrefix = mentionfix || prefix || "+";
    // if message doesn't start with prefix... skip (not break the loop because commands can still have custom prefixes)
    if (!message.content.toUpperCase().startsWith(usedPrefix.toUpperCase())) {
      continue;
    }
    // message without prefix
    const instruction = subContext.instruction = input.replace(
      new RegExp(`^${_.escapeRegExp(usedPrefix)}`), "");
    // get command & args
    const checkCommandRegex = cmd.pattern || new RegExp(
      `^${_.escapeRegExp(cmd.name)}(?:\\s{1,4}[^]*)?$`, "i");
    // if the command used is not this one... continue
    if (!checkCommandRegex.test(instruction)) {
      continue;
    }
    // check if command is disabled (and ensure eval isn't disabled :p)
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
    // get author's tag
    const authorTag = subContext.authorTag = msg.author.tag;
    logger.custom( // log when someone does a command. (mostly debugging)
      `User ${chalk.cyan(authorTag)}, ${
        channel instanceof TextChannel ?
        `at channel ${chalk.cyan("#" + channel.name)} of ${chalk.cyan(msg.guild.name)}` : // in a guild or...
        `in DMs with Salt` // ... in dms?
      }, ran command ${chalk.cyan(cmd.name)}.`, { prefix: "[CMD]", color: "magenta" });

    if (cmd.perms && guildId) { // permission checking :)
      const permsToCheck = typeof cmd.perms === "string" ? // a single perm or...
      {} :
      cloneObject(cmd.perms); // ...multiple perms?
      if (typeof cmd.perms === "string") {
        permsToCheck[cmd.perms] = Boolean(cmd.default); // (treat it like multiple but add it to object)
      }

      const parsedPerms = {};
      const setPerms = {};
      for (const permission in permsToCheck) {
        if (!permsToCheck.hasOwnProperty(permission)) {
          continue;
        }
        const isDefault = Boolean(permsToCheck[permission]); // if perm is default
        try {
          const permsResult = perms.hasPerm(msg.member, guildId, permission, isDefault); // execute hasPerm to check perm
          parsedPerms[permission] = Boolean(permsResult.hasPerm); // add if has perm
          setPerms[permission] = Boolean(permsResult.setPerm); // add if perm was set or is it default
        } catch (err) {
          parsedPerms[permission] = false; // ¯\_(ツ)_/¯
          setPerms[permission] = false;
          logger.custom(err, { prefix: `[ERR/PERMCHECK]`, color: "red", type: "error" });
        }
      }

      subContext.perms = parsedPerms;
      subContext.setPerms = setPerms;
    } else { // no perms to check...
      subContext.perms = null;
      subContext.setPerms = null;
    }

    const cmdRegex = new RegExp(`^${_.escapeRegExp(cmd.name)}\\s*`, "i"); // regex for fetching/replacing command name
    const args = subContext.args = instruction.replace(cmdRegex, "").length < 1 ? // arguments given...?
    null : // no
    instruction.replace(cmdRegex, ""); // yes
    subContext.arrArgs = args ? args.split(/\s+/) : []; // array form of arguments.
    subContext.self = subContext; // The context itself. (can be useful)
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
