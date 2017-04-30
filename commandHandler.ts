import {
  Channel, Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, StringResolvable,
  TextChannel, User,
} from "discord.js";
import * as _ from "lodash";
import { CommandSetPerm } from "./classes/command";
import logger from "./classes/logger";
import perms from "./classes/permissions";
import Searcher from "./classes/searcher";
import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "./util/bot";
import { chalk, Constants } from "./util/deps";
import { cloneObject, rejct } from "./util/funcs";

export * from "./misc/contextType";

export type ExtendedSend = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable, options?: ExtendedMsgOptions): Promise<Message | Message[]>;
  (options: ExtendedMsgOptions): Promise<Message | Message[]> };

export type SaltRole = "moderator" | "mod" | "administrator" | "admin";
const doError = logger.error;

export type TextBasedChannel = DMChannel | TextChannel | GroupDMChannel;

interface ICustomSendType {
  autoCatch?: boolean;
}

export interface IAmbigResult {
  cancelled: boolean;
  member?: GuildMember;
}

export type ExtendedMsgOptions = MessageOptions & ICustomSendType;

export default async (msg: Message) => {
  const input: string = msg.content;
  const channel: TextBasedChannel = msg.channel;
  const message: Message = msg;
  const guildId: string = msg.guild ? msg.guild.id : null;

  const sendingFunc = (func: (...args: any[]) => any): ExtendedSend => { // factory for sending functions
    return (content: StringResolvable | ExtendedMsgOptions, options?: ExtendedMsgOptions) => {
      if (typeof content === "object" && !options && !(content instanceof Array)) {
        options = content;
        content = "";
      } else if (!options) {
        options = {};
      }
      const result = channel.send.bind(channel)(content, options);
      if (options.autoCatch == null || options.autoCatch) {
        result.catch(rejct);
      }
      return result;
    };
  };
  const reply = sendingFunc(msg.reply.bind(msg));
  const send = sendingFunc(channel.send.bind(channel));

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
  const promptAmbig = async (members: GuildMember[]): Promise<IAmbigResult> => {
    let satisfied: boolean = false;
    let cancelled: boolean = false;
    let currentOptions: GuildMember[] = [];

    members.forEach((gm: GuildMember) => currentOptions.push(gm));
    const filter = (msg2: Message) => {
      const options = currentOptions;
      if (msg2.author.id !== msg.author.id) {
        return false;
      }
      if (msg2.content === "cancel" || msg2.content === "`cancel`") {
        cancelled = true;
        return true;
      }
      const tagOptions: string[] = options.map((gm: GuildMember) => gm.user.tag);
      if (tagOptions.includes(msg2.content)) {
        satisfied = true;
        currentOptions = [options[tagOptions.indexOf(msg2.content)]];
        return true;
      }
      const collOptions = new Collection<string, GuildMember>();
      options.forEach((gm: GuildMember) => {
        collOptions.set(gm.id, gm);
      });
      const searcher2: Searcher = new Searcher({ members: collOptions });
      const resultingMembers: GuildMember[] = searcher2.searchMember(msg2.content);
      if (resultingMembers.length < 1) {
        return true;
      }
      if (resultingMembers.length > 1) {
        currentOptions = resultingMembers;
        return true;
      }
      satisfied = true;
      currentOptions = resultingMembers;
      return true;
    };
    reply(`Multiple members have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
__**Members Matched**__:
\`${currentOptions.map((gm) => gm.user.tag).join("`,`")}\``);
    for (let i = 0; i < 5; i++) {
      try {
        const result = await channel.awaitMessages(
          filter, {
            time: Constants.times.AMBIGUITY_EXPIRE, maxMatches: 1,
            errors: ["time"],
          },
          );
        if (satisfied) {
          return {
            member: currentOptions[0],
            cancelled: false,
          };
        }
        if (cancelled) {
          send("Command cancelled.");
          return {
            member: null,
            cancelled: true,
          };
        }
        if (i < 5) {
          reply(`Multiple members have matched that search. Please specify one.
This command will automatically cancel after 30 seconds. Type \`cancel\` to cancel.
**Members Matched**:
\`${currentOptions.map((gm) => gm.user.tag).join("`,`")}\``);
        }
      } catch (err) {
        send("Command cancelled.");
        return {
          member: null,
          cancelled: true,
        };
      }
    }
    send("Automatically cancelled command.");
    return {
      member: null,
      cancelled: true,
    };
  };
  const hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;

  const userError = (data: string) => reply(
    `Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);

  const context: {[prop: string]: any} = {
    input, channel, message, msg, guildId,
    author: msg.author, member: msg.member,
    tag: `${msg.author.username}#${msg.author.discriminator}`,

    reply, send, hasPermission, hasPermissions: hasPermission,
    botmember: msg.guild ? msg.guild.member(bot.user) : null,
    searcher: msg.guild ? new Searcher({ guild: msg.guild }) : null,
    checkRole, promptAmbig,
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

    const authorTag: string = subContext.authorTag = `${msg.author.username}#${msg.author.discriminator}`;
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
