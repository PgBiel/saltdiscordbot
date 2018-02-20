const {
  Collection, Guild, GuildMember,
  TextChannel, User, Channel, GuildChannel, Role
} = require("discord.js");
const actionLog = require("./classes/actionlogger");
const messager = require("./classes/messager");
const Searcher = require("./classes/searcher");
const deps = require("./util/deps");
const { bot, Constants, db, logger, Time, util } = require("./util/deps");
const funcs = require("./funcs/funcs");
const { capitalize, cloneObject, rejct, uncompress, escMarkdown } = require("./funcs/funcs");

// const { bot, Constants, logger } = deps;
// const { cloneObject, rejct } = funcs;

/* export type ExtendedActionLogOptions = ILogOption & {
  guild?: any,
};

export type ExtendedSend = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable, options?: ExtendedMsgOptions): Promise<Message>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedSendArr = { // tslint:disable-line:interface-over-type-literal
  (content: StringResolvable[], options?: ExtendedMsgOptions): Promise<Message[]>;
  (options: ExtendedMsgOptions): Promise<Message> };

export type ExtendedMsgOptions = MessageOptions & ICustomSendType;

export interface IAmbigResult<T> {
  cancelled: boolean;
  member?: T;
}

interface ICustomSendType {
  autoCatch?: boolean;
}

export interface IDoEvalResult {
  success: boolean;
  result: any;
}

export interface IPromptOptions {
  question: string;
  invalidMsg: string;
  filter: ((msg: Message) => any);
  timeout?: number;
  cancel?: boolean;
  options?: ExtendedMsgOptions;
}

export type SaltRole = "moderator"
  | "mod"
  | "administrator"
  | "admin";

export type TextBasedChannel = DMChannel | TextChannel | GroupDMChannel; */

module.exports = function returnFuncs(msg) {
  const { author, guild, channel } = msg;
  const input = msg.content;
  const message = msg;
  const guildId = msg.guild ? msg.guild.id : null;

  const sendingFunc = func => { // factory for sending functions
    return (content, options) => {
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
      return options.deletable ? // react with a deleting emoji 
        result.then(messg => {
          if (channel.typing) channel.stopTyping();
          if (
            messg && // message was sent successfully
            messg.react && // message was actually sent successfully
            guild && // we're in a guild
            guild.me.hasPermission(["ADD_REACTIONS"]) && // I can add reactions
            channel && // ????
            channel.permissionsFor(guild.me).has(["ADD_REACTIONS"]) // I can definitely add reactions
          ) {
            messg.react(Constants.emoji.WASTEBASKET)
              .then(reaction => {
                messg.awaitReactions(
                  (react, usr) => react.emoji.name === Constants.emoji.WASTEBASKET && usr.id === author.id,
                  { time: Time.minutes(1), max: 1, errors: ["time"] }
                )
                  .then(collected => messg.delete())
                  .catch(() => reaction.users.remove(bot.user).catch(() => {}));
              })
              .catch(err => rejct(err, "[TRASH-REACT-1]"));
          }
          return messg;
        }) :
        result;
    };
  };
  const reply = sendingFunc(msg.reply.bind(msg));
  const send = sendingFunc(channel.send.bind(channel));
  const checkRole = async (role, member) => {
    if (["mod", "admin"].includes(role)) {
      role = role === "mod" ? "moderator" : "administrator";
    }
    if (!guildId) {
      return false;
    }
    const result = await (db.table("mods").get(guild.id));
    if (!result || !result[role]) {
      return false;
    }
    if (Array.isArray(result[role])) {
      for (const roleID of result[role]) {
        if (member.roles.has(uncompress(roleID))) return true;
      }
    } else {
      return member.roles.has(uncompress(result[role]));
    }
  };
  const promptAmbig = async (subjects, pluralName = "members", opts = { type: "member" }) => {
    let satisfied = false;
    let cancelled = false;
    let currentOptions = [];
    const { type, channelType = "text" } = opts;

    const getTag = gm => {
      if (gm instanceof GuildChannel) {
        return `#${gm.name}`;
      } else if (gm.user) {
        return gm.user.tag;
      } else if (gm.tag) {
        return gm.tag;
      } else {
        return gm.toString();
      }
    };

    subjects.forEach(gm => currentOptions.push(gm));
    const filter = msg2 => {
      const cont = msg2.content;
      const options = currentOptions;
      if (msg2.author.id !== msg.author.id) {
        return false;
      }
      if (cont === "cancel" || cont === "`cancel`") {
        cancelled = true;
        return true;
      }
      if (/^#\d+$/.test(cont)) {
        const nNumber = cont.match(/^#(\d+)$/)[1];
        if (nNumber.length < 5) {
          const number = Number(nNumber);
          if (number % 1 === 0 && number > 0 && number < 51 && number <= options.length) {
            satisfied = true;
            currentOptions = [options[Number(number) - 1]];
            return true;
          }
        }
      }
      const tagOptions = [];
      for (const gm of options) {
        if (gm instanceof Role || gm instanceof GuildChannel) {
          tagOptions.push(String(gm));
        } else {
          tagOptions.push(getTag(gm));
        }
      }
      if (tagOptions.includes(cont)) {
        satisfied = true;
        currentOptions = [options[tagOptions.indexOf(cont)]];
        return true;
      }
      const collOptions = new Collection();
      options.forEach(gm => {
        collOptions.set(gm.id || gm.toString(), gm);
      });
      const searcher2 = new Searcher({ [type + "s"]: collOptions });
      const resultingMembers = type === "channel" ?
        searcher2.searchChannel(cont.replace(/^#/, ""), channelType || "text") :
        (type === "role" ?
          searcher2.searchRole(cont) :
          searcher2.searchMember(cont)
        );
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
    reply(`Multiple ${pluralName} have matched that search. Please specify one, or a number preceded by \`#\` (e.g. \`#1\`).
This command will automatically cancel after 25 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`);
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const result = await channel.awaitMessages(
          filter, {
            time: Constants.times.AMBIGUITY_EXPIRE, max: 1,
            errors: ["time"]
          },
        );
        if (satisfied) {
          return {
            subject: currentOptions[0],
            cancelled: false
          };
        }
        if (cancelled) {
          send("Command cancelled.");
          return {
            subject: null,
            cancelled: true
          };
        }
        if (i < 5) {
          reply(`Multiple ${pluralName} have matched that search. Please specify one. Please specify one, or a number preceded by \`#\` (e.g. \`#1\`).
This command will automatically cancel after 25 seconds. Type \`cancel\` to cancel.
**${capitalize(pluralName)} Matched**:
${currentOptions.map((gm, i) => `\`#${i + 1}\`: \`${getTag(gm).replace(/`/g, "'")}\``).join(", ")}`);
        }
      } catch (err) {
        logger.error(`At PromptAmbig: ${err}`);
        send("Command cancelled.");
        return {
          subject: null,
          cancelled: true
        };
      }
    }
    send("Automatically cancelled command.");
    return {
      subject: null,
      cancelled: true
    };
  };
  const hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;

  const userError = data => reply(
    `Sorry, but it seems there was an error while executing this command. \
If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);

  const prompt = async (
    {
      question, invalidMsg, filter,
      timeout = Constants.times.AMBIGUITY_EXPIRE, cancel = true,
      skip = false, options = {}, author = msg.author
    },
  ) => {
    let skipped = false;
    let cancelled = false;
    let satisfied = null;
    const filterToUse = msg2 => {
      if (author && msg2.author.id !== (author.id || author)) return false;
      if (msg2.content.toLowerCase() === "cancel" && cancel) {
        return (cancelled = true);
      }
      if (msg2.content.toLowerCase() === "skip" && skip) {
        return (skipped = true);
      }
      const result = filter(msg2);
      satisfied = result ? msg2 : null;
      return true;
    };
    const sentmsg = await send(question, options || {});
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const msgs = await msg.channel.awaitMessages(filterToUse, { time: timeout, max: 1, errors: ["time"] });
        if (cancelled || skipped) {
          break;
        }
        if (!satisfied) {
          if (i < Constants.numbers.MAX_PROMPT) {
            send(invalidMsg);
          } else {
            cancelled = true;
          }
          continue;
        }
        if (satisfied) {
          return { res: satisfied.content, cancelled, skipped };
        }
      } catch (err) {
        if (!(err instanceof Collection)) rejct(err, "{AT PROMPT}");
        cancelled = true;
        break;
      }
    }
    if (!skipped) send("Command cancelled.");
    return { res: "", cancelled, skipped };
  };

  const genPrompt = options => {
    return async function() {
      const { res, cancelled, skipped } = await prompt(Object.assign({ question: this.text }, options));
      if (options.array) {
        if (typeof options.index === "number" && !isNaN(options.index)) {
          options.array[options.index] = res;
        } else {
          options.array.push(res);
        }
      }
      if (typeof options.branch === "function") {
        const branch = (this.branch(options.branch(res, cancelled, skipped)) || { exec: async _ => _ });
        if (options.exec && (options.goCancelled ? true : !cancelled)) await branch.exec();
      }
    };
  };

  /* /**
   * Multi-prompt
   * @param {Array} branches branches
   * @param {object} options Options
   * @param {number} [options.timeout=15000] Timeout
   * @param {boolean} [options.cancel=true] If should be able to cancel
   * @param {string} [options.invalidMsg] An invalid message
   * /
  const multiPrompt = async (branches, { timeout = Time.seconds(15), cancel = true, invalidMsg } = {}) => {
    if (!Array.isArray(branches)) return [];
    const results = [];
    let ii = 0;
    const forF = async branches => {
      for (const [options, branch] of branches) {
        const i = ii++;
        if (!options.func) continue;
        const prompted = await prompt(Object.assign({ timeout, cancel, invalidMsg }, options));
        if (!prompted) break;
        const res = options.func(prompted, { i, options, branch });
        if (res) results.push(res.result);
        if (!res || !branch || !branch[res.next] || !Array.isArray(branch)) continue;
        await forF(branch);
      }
    };
  }; */

  const actionLog2 = options => {
    if (!msg.guild) {
      return;
    }
    const newOptions = Object.assign({ guild: msg.guild }, options);
    return actionLog.log(newOptions);
  };

  const seePerm = async (perm, perms, setPerms, { srole, hperms }) => {
    if (setPerms[perm] && perms[perm]) return true;
    if (hperms && hasPermission(Array.isArray(hperms) ? hperms : [hperms])) return true;
    if (srole && await checkRole(srole)) return true;
    return perms[perm] || false;
  };

  let obj = {
    hasPermission, userError, promptAmbig, checkRole,
    send, reply, prompt, actionLog: actionLog2, seePerm, genPrompt,
    genPromptD: optionsD => options => genPrompt(Object.assign({}, optionsD, options))
  };

  const doEval = (content, subC = {}) => {
    const objectToUse = Object.assign({}, obj, {
      bot, msg, message: msg,
      channel, guildId, deps,
      funcs, context: subC || {},
      guild, db
    });
    const data = {
      content,
      id: Date.now(),
      vars: objectToUse
    };
    return messager.awaitForThenEmit("doEval", data, data.id + "eval");
  };
  obj = Object.assign(obj, { doEval });

  return obj;
};
