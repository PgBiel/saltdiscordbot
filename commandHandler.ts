import { Collection, GuildMember, Message, User } from "discord.js";
import * as _ from "lodash";
import logger from "./classes/logger";
import perms from "./classes/permissions";
import { moderation, prefixes } from "./sequelize/sequelize";
import { bot } from "./util/bot";
import { cloneObject, rejct } from "./util/funcs";

export * from "./misc/contextType";

export type SaltRole = "moderator" | "mod" | "administrator" | "admin";
type CommandSetPerm = boolean | { default: boolean };
const doError = logger.error;

export default async (msg: Message) => {
  const input = msg.content;
  const chanel = msg.channel;
  const message = msg;
  const upparcaso = input.toUpperCase();
  const gueldid = message.guild ? message.guild.id : null;
  let thingy;
  try {
    thingy = msg.guild ? (await prefixes.findOne({ where: { serverid: msg.guild.id } })) || "+" : "+";
  } catch (err) {
    logger.error(`Error at Command Handler (await/thingy): ${err}`);
    return;
  }
  let prefix;
  if (thingy) {
    prefix = thingy.prefix || thingy;
  }
  logger.debug(prefix);
  let mentionfix;
  if (/^<@!?244533925408538624>\s?/i.test(input)) {
    if (!(/^<@!?244533925408538624>\s?/i.test(prefix))) {
      mentionfix = input.match(/^(<@!?244533925408538624>\s?)/)[1];
    }
  }
  const disabledReply = (pt: string) => message.reply(":lock: That command has been disabled for this " + pt + "!");
  const checkRole = async (role: SaltRole, member: GuildMember): Promise<boolean> => {
    if (["mod", "admin"].includes(role)) {
      role = role === "mod" ? "moderator" : "administrator";
    }
    if (!gueldid) {
      return false;
    }
    const result: {[prop: string]: any} = await moderation.findOne({ where: { serverid: gueldid } });
    if (!result || !result[role]) {
      return false;
    }
    if (member.roles && member.roles.get(result[role])) {
      return true;
    }
    return false;
  };
  const checkPerm = (node: string, author: GuildMember | User = message.member, isDefault: boolean = false) => {
    if (author instanceof User) {
      const oldAuthor = author;
      author = message.guild.members.get(author.id);
      if (!author) {
        throw new Error(`Invalid member: ${oldAuthor.username}`);
      }
    }
    return perms.hasPerm(author, gueldid, node, isDefault);
  };
  const theGrandObject: {[prop: string]: any} = {
    checkPerm, disabledReply, checkRole, prefix, gueldid, mentionfix, upparcaso, input, chanel, msg,

    channel: chanel, guildid: gueldid, inputUpCase: upparcaso, send: chanel.send.bind(chanel),
    reply: msg.reply.bind(msg), message: msg, content: msg.content,
  };
  if (msg.channel.type === "text" && !(msg.author.bot)) {
    (() => {
      // start of text channel part
      theGrandObject.botmember = msg.guild.member(bot.user);
      theGrandObject.hasPermission = message.member.hasPermission.bind(message.member);
      // require("./misc/autoSaver.js")(msg, gueldid);
      if (/^\+prefix/i.test(input)) {
        const instruction = input.replace(/^\+/i, "");
        theGrandObject.instruction = instruction;
        theGrandObject.args = instruction.replace(
          /^prefix\s*/i, "").length < 1 ? null : instruction.replace(/^prefix\s*/i, "");
        theGrandObject.arrArgs = theGrandObject.args ? theGrandObject.args.split` ` : null;
        return bot.commands.prefix && bot.commands.prefix.func(message, theGrandObject);
      }
      if (!(upparcaso.startsWith(prefix.toUpperCase()) || /^<@!?244533925408538624>\s?/i.test(upparcaso))) {
        return; // console.log(colors.green("AAAAA"), upparcaso, prefix);
      }
      const instruction = input.replace(new RegExp("^" + _.escapeRegExp(mentionfix || prefix), "i"), "");
      theGrandObject.instruction = instruction;
      logger.debug(instruction);
      for (const cmdn in bot.commands) {
        if (bot.commands.hasOwnProperty(cmdn)) {
          const cmd = bot.commands[cmdn];
          /* const noPattern = _=>{
            console.error(colors.red("[ERROR]") + " Attempted to load " + (
            cmd.name?`command ${cmd.name}`:"unnamed command"
            ) + " but " + (_||"it had no pattern!"));
            tocontinue = true;
          };*/
          // if (!(cmd.pattern)) noPattern();
          /* if (
          !(cmd.pattern instanceof RegExp || typeof cmd.pattern === "string")
          ) noPattern("it had an invalid pattern!"); */
          if (!(cmd.func)) {
            logger.error(
              `Attemped to load ${cmd.name ? `command ${cmd.name}` : "unnamed command"} but it had no function!`,
              );
            continue;
          }
          if (cmd.name === "prefix") {
            continue;
          }
          const exeFunc = async () => {
            let disabled: string;
            try {
              disabled = await perms.isDisabled(gueldid, chanel.id, cmd.name); // is disabled?
            } catch (err) {
              return rejct(err);
            }
            if (disabled) {
              return message.reply(":lock: That command is disabled for this " + disabled + "!");
            }
            const zeperms = cmd.perms;
            if (zeperms) { // if it uses permissions then
              const usedpermissions: {[permission: string]: CommandSetPerm} = typeof zeperms === "string" ?
              {} :
              cloneObject(zeperms); // what we are going to use
              if (typeof zeperms === "string") {
                usedpermissions[zeperms] = !!cmd.default; // if it's a string (a single perm) then set it
              }
              const parsedPerms = {}; // parsed perms
              for (const permission in usedpermissions) {
                if (usedpermissions.hasOwnProperty(permission)) {
                  const isDefault = usedpermissions[permission];
                  try {
                    parsedPerms[permission] = await perms.hasPerm(
                      msg.member, gueldid, permission, typeof isDefault === "boolean" ? isDefault : !!isDefault.default,
                      ); // check perm
                  } catch (err) {
                    parsedPerms[permission] = false; // error :(
                    logger.custom(err, `[ERR/PERMCHECK]`, "red", "error");
                  }
                  parsedPerms[permission] = !!parsedPerms[permission];
                  }
              }
              theGrandObject.perms = parsedPerms;
            }

            theGrandObject.args = instruction.replace(`^${_.escapeRegExp(cmd.name)}\\s*`, "i").length < 1 ?
            null :
            instruction.replace(`^${_.escapeRegExp(cmd.name)}\s*`, "i");

            theGrandObject.arrArgs = theGrandObject.args ? theGrandObject.args.split` ` : null; // array args
            let result;
            try {
              result = cmd.func(message, theGrandObject); // execute command
            } catch (err) {
              return doError(err);
            }
            if (result instanceof Promise) {
              result.catch(rejct);
            }
          };
          // console.log(chalk.green("[DEBUG 101]"), new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\\s*[^]+)?$`, "i"));
          if (
            cmd.pattern && cmd.pattern instanceof RegExp ? cmd.pattern.test(instruction) : cmd.pattern === instruction
            || (new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\s*[^]+)?$`, "i")).test(instruction)
          ) {
            return exeFunc().catch(rejct);
          }
        }
      }
      // end of text channel part
    })();
  }
};
