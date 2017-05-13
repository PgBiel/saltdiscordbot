import {
  Collection, DMChannel, GroupDMChannel, GuildMember, Message, MessageOptions, StringResolvable, TextChannel,
} from "discord.js";
import messager from "./classes/messager";
import Searcher from "./classes/searcher";
import { moderation } from "./sequelize/sequelize";
import * as deps from "./util/deps";
import { bot, Constants, logger } from "./util/deps";
import * as funcs from "./util/funcs";
import { cloneObject, rejct } from "./util/funcs";

// const { bot, Constants, logger } = deps;
// const { cloneObject, rejct } = funcs;

export type ExtendedSend = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable, options?: ExtendedMsgOptions): Promise<Message>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedSendArr = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable[], options?: ExtendedMsgOptions): Promise<Message[]>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedMsgOptions = MessageOptions & ICustomSendType;

export interface IAmbigResult {
  cancelled: boolean;
  member?: GuildMember;
}

interface ICustomSendType {
  autoCatch?: boolean;
}

export interface IDoEvalResult {
  success: boolean;
  result: any;
}

export type SaltRole = "moderator"
  | "mod"
  | "administrator"
  | "admin";

export type TextBasedChannel = DMChannel | TextChannel | GroupDMChannel;

export default function returnFuncs(msg: Message) {
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
      const result = func(content, options);
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
**Members Matched**:
\`${currentOptions.map((gm) => gm.user.tag).join("`,`")}\``);
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
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
        logger.error(`At PromptAmbig: ${err}`);
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
  const hasPermission: typeof msg.member.hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;

  const userError = (data: string) => reply(
    `Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);

  const prompt = async (
    question: string, invalidMsg: string, filter: ((msg: Message) => any),
    timeout: number = Constants.times.AMBIGUITY_EXPIRE, cancel: boolean = true,
    options: ExtendedMsgOptions = {},
  ): Promise<string> => {
    let cancelled: boolean = false;
    let satisfied: Message = null;
    const filterToUse = (msg2: Message) => {
      if (msg2.content === "cancel" && cancel) {
        return (cancelled = true);
      }
      const result = filter(msg2);
      if (result !== false && result != null) {
        return (satisfied = msg2);
      }
    };
    const sentmsg = await send(question, options || {});
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const msgs = await msg.channel.awaitMessages(filter, { time: timeout, maxMatches: 1, errors: ["time"] });
        if (!satisfied) {
          if (i < 5) {
            send(invalidMsg);
          }
          continue;
        }
        if (cancelled) {
          break;
        }
        if (satisfied) {
          return satisfied.content;
        }
      } catch (err) {
        break;
      }
    }
    send("Command cancelled.");
    return "";
  };

  const obj: {[func: string]: (...args: any[]) => any} = {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, prompt,
  };

  const doEval = (content: string) => {
    let objectToUse = cloneObject(obj);
    objectToUse = Object.assign(objectToUse, {
      bot, msg, message: msg,
      channel, guildId, deps,
      funcs,
    });
    const data = {
      content,
      id: Date.now(),
      vars: objectToUse,
    };
    return messager.awaitForThenEmit("doEval", data, data.id + "eval");
  };
  obj.doEval = doEval;

  return obj;
}
