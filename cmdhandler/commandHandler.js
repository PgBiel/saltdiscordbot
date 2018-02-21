const {
  Channel, Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, StringResolvable,
  TextChannel, User
} = require("discord.js");
const _ = require("lodash");
const logger = require("../classes/logger");
const Searcher = require("../classes/searcher");
const funcs = require("../handlerfuncs/commandHandlerFuncs");
// const { moderation, prefixes } = require("./sequelize/sequelize");
const { bot } = require("../util/bot");
const { chalk } = require("../util/deps");
const {
  cloneObject, fetchPrefix, fetchPerms, fetchDisable, rejct
} = require("../funcs/funcs");
const wordFilterer = require("./wordFilterer");

/* export * from "./misc/contextType";

export * from "./commandHandlerFuncs"; */

const doError = logger.error;

module.exports = async msg => {
  // initialize some vars
  const input = msg.content;
  const channel = msg.channel;
  const message = msg;
  const guildId = msg.guild ? msg.guild.id : null;

  const cmdFuncs = funcs(msg) || {};

  const {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, doEval, prompt, actionLog, seePerm, genPrompt, genPromptD
  } = funcs(msg);

  const context = Object.assign({
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    tag: `${msg.author.username}#${msg.author.discriminator}`,
    guild: msg.guild, dummy: {},

    hasPermissions: cmdFuncs.hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    searcher: msg.guild ? new Searcher({ guild: msg.guild }) : null
  }, cmdFuncs);
  // fetch prefix from db
  const possiblePrefix = await fetchPrefix(guildId);
  // if command was executed (to be defined in the loop)
  let commandExed = false;
  let filteredWord = false;
  if (!msg.author.bot) {
    // word filter
    try {
      filteredWord = await wordFilterer(msg, context, true);
    } catch (err) {
      rejct(err);
    }
    // loop commands to find a match
    for (const cmdn in bot.commands) {
      // safety thing
      if (!bot.commands.hasOwnProperty(cmdn)) {
        continue;
      }
      // make our own copy of context to modify safely (otherwise it would repeat for all tests)
      const cmd = typeof bot.commands[cmdn] === "function" ? new (bot.commands[cmdn]) : bot.commands[cmdn];
      const subContext = cloneObject(context);
      subContext.dummy = {};
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
        const { disabled, type, error } = await fetchDisable(cmd.name, guildId, channel.id);
        if (disabled) {
          return send(":lock: That command is disabled for this " + type + "!");
        }
        if (error) {
          return userError(`AT DISABLE`);
        }
      }
      // get author's tag
      const authorTag = subContext.authorTag = msg.author.tag;
      logger.custom( // log when someone does a command. (temporary, mostly debugging)
        `User ${chalk.cyan(authorTag)}, ${
          channel instanceof TextChannel ?
          `at channel ${chalk.cyan("#" + channel.name)} of ${chalk.cyan(msg.guild.name)}` : // in a guild or...
          `in DMs with Salt` // ... in dms?
        }, ran command ${chalk.cyan(cmd.name)}.`, { prefix: "[CMD]", color: "magenta" });

      if (cmd.perms && guildId) { // permission checking :)
        const { parsedPerms, setPerms } = await fetchPerms(cmd.perms, msg.member, cmd.default);

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
        const result = await descCmd.exec(message, subContext);
      } catch (err) {
        logger.error(`At Execution: ${err.stack}`);
        return userError("AT EXECUTION");
      }
      commandExed = true;
      break;
    }
  }
};
