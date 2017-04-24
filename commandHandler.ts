import { Collection, GuildMember, Message, User } from "discord.js";
import { logger } from "../util/deps";

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
  const {Collection} = Discord;
  let mentionfix;
  if (/^<@!?244533925408538624>\s?/i.test(input)) {
    if (!(/^<@!?244533925408538624>\s?/i.test(prefix))) {
      mentionfix = input.match(/^(<@!?244533925408538624>\s?)/)[1];
    }
  }
  const disabledreply = (pt: string) => message.reply(":lock: That command has been disabled for this " + pt + "!");
  const checkmodrole = (member: GuildMember) => {
    if (servermods[gueldid]) {
      if (servermods[gueldid].moderator !== "") {
        if (member.roles.get(servermods[gueldid].moderator)) {
          return true;
        } else {
          return false;
        }
      }
    }
  };
  const checkperm = (node: string, returnarr: boolean = true, author: GuildMember | User = message.member) => {
    return returnarr ?
    permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) :
    (typeof (permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)) === "string" ?
      permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id) :
      permclass.checkPerms(node, perms, author, servercmds, message.guild.id, message.channel.id)[0]);
  };
  const theGrandObject: {[prop: string]: any} = {
    checkperm, disabledreply, checkmodrole, prefix, gueldid, mentionfix, upparcaso, input, chanel, msg,

    channel: chanel, guildid: gueldid, inputUpCase: upparcaso, send: chanel.send.bind(chanel),
    reply: msg.reply.bind(msg), message: msg, content: msg.content,
  };
  if (msg.channel.type === "text" && !(msg.author.bot)) {
    (() => {
      // start of text channel part
      theGrandObject.botmember = msg.guild.member(bot.user);
      // require("./misc/autoSaver.js")(msg, gueldid);
      if (/^\+prefix/i.test(input)) {
        const instruction = input.replace(/^\+/i, "");
        theGrandObject.instruction = instruction;
        theGrandObject.args = instruction.replace(
          /^prefix\s*/i, "").length < 1 ? null : instruction.replace(/^prefix\s*/i, "");
        theGrandObject.arrargs = theGrandObject.args ? theGrandObject.args.split` ` : null;
        return bot.commands.prefix.func(message, theGrandObject);
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
              ` Attemped to load ${cmd.name ? `command ${cmd.name}` : "unnamed command"} but it had no function!`,
              );
            continue;
          }
          if (cmd.name === "prefix") {
            continue;
          }
          const exeFunc = async () => {
            let disabled;
            try {
              disabled = await perms.isDisabled(gueldid, chanel.id, cmd.name); // is disabled?
            } catch (err) {
              return rejct(err);
            }
            if (disabled) {
              return message.reply(":lock: That command is disabled for this " + flummery + "!");
            }
            const zeperms = cmd.perms;
            if (zeperms) { // if it uses permissions then
              const targetobj = typeof zeperms === "string" ? {} : cloneObject(zeperms); // what we are going to use
              if (typeof zeperms === "string") {
                targetobj[zeperms] = !!cmd.default; // if it's a string then set it
              }
              const flummery = {}; // parsed perms
              for (const thang in targetobj) {
                if (targetobj.hasOwnProperty(thang)) {
                  const thingy2 = targetobj[thang];
                  try {
                    flummery[thang] = await perms.hasPerm(
                      msg.member, gueldid, thang, typeof thingy2 === "boolean" ? thingy2 : !!thingy2.default,
                      ); // check perm
                  } catch (err) {
                    flummery[thang] = false; // error :(
                    logger.custom(err, `[ERR/PERMCHECK]`, "red", "error");
                  }
                  flummery[thang] = !!flummery[thang];
                  }
              }
              theGrandObject.perms = flummery;
            }

            theGrandObject.args = instruction.replace(`^${_.escapeRegExp(cmd.name)}\\s*`, "i").length < 1 ?
            null :
            instruction.replace(`^${_.escapeRegExp(cmd.name)}\s*`, "i");

            theGrandObject.arrargs = theGrandObject.args ? theGrandObject.args.split` ` : null; // array args
            let result;
            try {
              result = cmd.func(message, theGrandObject); // execute command
            } catch (err) {
              return funcs.doError(err);
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
