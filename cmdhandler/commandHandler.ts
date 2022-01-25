import {
  Channel, Collection, DMChannel, GuildMember, Message, MessageOptions,
  TextChannel, User
} from "discord.js";
import * as _ from "lodash";
import logger from "../classes/logger";
import Searcher from "../classes/searcher";
import funcs from "../handlerfuncs/commandHandlerFuncs";
// import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "../util/bot";
import { chalk, Command } from "../util/deps";
import {
  cloneObject, fetchPrefix, fetchPerms, fetchDisable, rejct
} from "../funcs/funcs";
import wordFilterer from "./wordFilterer";
import { Context, TContext } from "../misc/contextType";

/* export * from "./misc/contextType";

export * from "./commandHandlerFuncs"; */

const doError = logger.error;

export default async (msg: Message) => {
  // initialize some vars
  const input: string = msg.content;
  const channel = msg.channel;
  const message: Message = msg;
  const guildId: string = msg.guild ? msg.guild.id : null;

  const cmdFuncs = funcs(msg) || {} as never;

  const { send, userError } = cmdFuncs;

  const context: Partial<Context> = Object.assign({
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    guild: msg.guild, dummy: {}, content: msg.content,

    hasPermissions: cmdFuncs.hasPermission,
    botmember: msg.guild ? msg.guild.members.resolve(bot.user) : null,
    searcher: msg.guild ? new Searcher({ guild: msg.guild }) : null
  }, cmdFuncs);
  // fetch prefix from db
  const possiblePrefix = await fetchPrefix(guildId);
  // if command was executed (to be defined in the loop)
  let commandExed = false;
  let filteredWord = false;
  if (!msg.author.bot) {
    // word filter
    if (msg.guild) {
      try {
        filteredWord = await wordFilterer(msg, context as TContext, true);
      } catch (err) {
        rejct(err);
      }
    }
    // loop commands to find a match
    for (const cmdn in bot.commands) {
      // safety thing
      if (!bot.commands.hasOwnProperty(cmdn)) {
        continue;
      }
      // make our own copy of context to modify safely (otherwise it would repeat for all tests)
      const cmd: Command = typeof bot.commands[cmdn] === "function" ?
        new (bot.commands[cmdn] as any)() :
        bot.commands[cmdn];
      const subContext = cloneObject(context);
      subContext.dummy = {};
      const descCmd = cmd.aliasData && cmd.aliasData.__aliasOf ? cmd.aliasData.__aliasOf : cmd;
      // if the command doesn't exist or doesn't do anything... Ignore it
      if (!cmd.name || !descCmd.func) {
        continue;
      }
      let prefix: string;
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
      const mentionfix: string = input.startsWith(`<@${bot.user.id}> `) ? `<@${bot.user.id}> ` : null;
      // ...then really determine the prefix used.
      const usedPrefix: string = mentionfix || prefix || "+";
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
      subContext.self = subContext as Context; // The context itself. (can be useful)
      // and finally... we execute the command.
      try {
        const result = await descCmd.exec(message, subContext as Context);
      } catch (err) {
        logger.error(`At Execution: ${err.stack}`);
        return userError("AT EXECUTION");
      }
      // if (channel.typing) channel.stopTyping();
      commandExed = true;
      break;
    }
  }
};
