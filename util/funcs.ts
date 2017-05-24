import { Guild } from "discord.js";
import Command from "../classes/command";
import * as cmds from "../commands/cmdIndex";
import {
  _, bot, commandHandler, commandParse, Constants, Discord, fs, logger, messager, models, Time,
  xreg,
} from "./deps";

export interface IMessagerEvalData {
  content: string;
  vars: {[prop: string]: any};
  id: number;
}

export interface IMuteParseResults {
  ok: boolean;
  user: string;
  time: Time;
  reason: string;
}

/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @returns {void}
 */
export function rejct(rejection: any): void {
  logger.custom(rejection, "[ERR/REJECT]", "red", "error");
}

/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @returns {*} The required value
 */
export function ncrequire(fpath: string) {
  delete require.cache[require.resolve(fpath)];
  return require(fpath);
}

/**
 * Factory function for event function for doEval on messager
 * @param {*} evaler The eval function
 * @returns {Function} The generated function
 */
export function messagerDoEval(evaler: any) {
  /**
   * Event function for doEval on messager
   * @param {*} data Data
   * @returns {void}
   */
  return (data: IMessagerEvalData) => {
    const { bot, message, msg, input, channel, deps, funcs, guildId, send, reply } = data.vars;
    try {
      const result = eval(data.content); // tslint:disable-line:no-eval
      messager.emit(`${data.id}eval`, {
        success: true,
        result,
      });
    } catch (err) {
      messager.emit(`${data.id}eval`, {
        success: false,
        result: err,
      });
    }
  };
}
export function djsDebug(info: string) {
  logger.custom(
    info, `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`, "magenta",
    );
}
export function djsWarn(info: string) {
  logger.custom(info, `[DJS WARN]`, "yellow");
}
export function botMessage(msg: Discord.Message) {
  const thingy = commandHandler(msg);
  if (thingy.catch) {
    thingy.catch(rejct);
  }
}
export function processMessage(data: any) {
  logger.debug("Received message");
}
/**
 * Clone an object.
 * @param {*} objec The object.
 * @returns {*} The cloned object.
 */
export function cloneObject <T>(objec: T): T {
  return Object.assign(Object.create((objec as any)), objec);
}
/**
 * Loads commands.
 * @returns {void}
 */
export function loadCmds(): void {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const loadedCmds = ncrequire("../commands/cmdIndex").commands;
  for (const cmdn in loadedCmds) {
    if (loadedCmds.hasOwnProperty(cmdn)) {
      const cmd: Command = loadedCmds[cmdn];
      // const parsed = commandParse(loadedCmds[cmd]);
      // if (parsed) {
      bot.commands[cmd.name] = cmd;
      // }
    }
  }
}
// tslint:disable-next-line:prefer-const
let isUnique = (err: Error) => err == null ? false : err.name === Constants.sql.UNIQUE_CONSTRAINT;
export function SQLLogger(...stuff: string[]) {
  return logger.custom(stuff.join(" "), "[SQL]", "yellow");
}
export function doError(...stuff: string[]): void {
  return logger.error.apply(logger, [...stuff]);
}
export function bcEval() {
  return bot.shard.broadcastEval.apply(bot.shard, Array.from(arguments));
}
/**
 * Get a random value between two numbers.
 * @param {number} min The minimum number.
 * @param {number} max The maximum number.
 * @returns {number}
 */
export function random(min: number, max: number): number {
  if (isNaN(min) || isNaN(max)) {
    return;
  }
  [min, max] = [Math.ceil(Number(min)), Math.floor(Number(max))];
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Escape Discord markdown in a string.
 * @param {string} str The string.
 * @param {boolean} [escaper=false] If backslash should be escaped.
 * @returns {string} The newly escaped string.
 */
export function escMarkdown(str: string, escaper: boolean = false): string {
  const regex = new RegExp(`[\`*_~${escaper ? "\\\\" : ""}]`, "g");
  return str.replace(regex, (piece: string) => "\\" + piece);
}
/**
 * Abstract strings if it is too long.
 * @param {string} text The string to abstract.
 * @param {number} length The max length.
 * @returns {string} The abstracted string.
 */
export function textAbstract(text: string, length: number): string {
    if (text == null) {
        return "";
    }
    if (typeof text !== "string") {
      try {
        text = (text as any).toString();
      } catch (err) {
        text = String(text);
      }
    }
    if (typeof length !== "number") {
      if (isNaN(length)) {
        throw new TypeError("Length must be a number!");
      }
      length = Number(length);
    }
    if (text.length <= length) {
        return text;
    }
    const newText = text.substring(0, length).replace(/[^]{0,3}$/, "...");
    return newText || "...";
}
/**
 * Combine regexs into one.
 * @param {RegExp[]|string[]} regs The RegExp expressions or strings.
 * @param {string} [options] The flags.
 * @returns {RegExp} The combined regex.
 */
export function combineRegex(regs: Array<string | RegExp>, options: string = ""): RegExp {
  let regexStr = "";
  for (const match of regs) {
    regexStr += match instanceof RegExp ? match.source : match;
  }
  return new RegExp(regexStr, options);
}

/**
 * Parse a time string. (Used for mute command)
 * @param {string} str The time string.
 * @returns {?Object} The parsed time, with all units as a property.
 */
export function parseTimeStr(str: string): typeof Time.prototype.units {
  logger.debug(str);
  const time = new Time();
  if (typeof str !== "string") {
    return time.units;
  }
  const match = str.match(Constants.regex.MUTE.TIME_MATCH);
  if (!match || match.length < 1) {
    return time.units;
  }
  logger.debug(match);
  for (const result of match) {
    const [amount, unit] = [
      result.match(Constants.regex.MUTE.SINGLE_TIME_MATCH(true))[1],
      result.match(Constants.regex.MUTE.SINGLE_TIME_MATCH(false))[1],
    ];
    if (Time.validUnit(unit)) {
      time.add(unit, Number(amount));
    }
  }
  return time.units;
}

/**
 * Make a mute role.
 * @param {Guild} guild The guild to create the mute role at.
 * @returns {Promise<Role>} The created role.
 */
export async function createMutedRole(guild: Guild) {
  const newRole = await guild.createRole({
    name: "SaltMuted",
    permissions: [],
  });
  for (const [id, channel] of guild.channels) {
    channel.overwritePermissions(newRole, { SEND_MESSAGES: false }).catch(rejct);
  }
  return newRole;
}

/**
 * Convert a string to binary.
 * @param {string} str The string to convert.
 * @param {string} [joinChar] The character to separate each separate digit. " " by default.
 * @param {string} [unicodeJoinChar] The character to separate each character used to make one bigger character.
 * Nothing by default.
 * @returns {string} The converted string.
 */
export function toBin(str: string, joinChar: string = " ", unicodeJoinChar: string = ""): string {
  const PADDING = "0".repeat(8);

  const resultArr: string[] = [];

  if (typeof str !== "string") {
    try {
      str = (str as any).toString();
    } catch (err) {
      str = String(str);
    }
  }

  for (const i of Object.keys(str)) {
    if (isNaN(Number(i))) {
      return;
    }
    const compact: string = str.charCodeAt(Number(i)).toString(2);
    if (compact.length / 8 > 1) {
      const el: string[] = [];
      compact.match(/[^]{8}/g).forEach((byte: string) => {
        const padded2: string = PADDING.substring(0, PADDING.length - byte.length) + byte;
        el.push(padded2);
      });
      resultArr.push(el.join(unicodeJoinChar || ""));
      continue;
    }
    const padded: string = PADDING.substring(0, PADDING.length - compact.length) + compact;
    resultArr.push(padded);
  }
  const result: string = resultArr.join(joinChar);
  return result;
}

/**
 * Parse arguments for the mute command.
 * @param {string} str The arguments.
 * @returns {Object} The result.
 */
export function parseMute(str: string): IMuteParseResults {
  const obj = {
    ok: true,
    user: "",
    time: null,
    reason: "",
  };
  const reg = xreg(Constants.regex.MUTE.MATCH_REG, "x");
  const results = str.match(reg);
  if (!results) {
    obj.ok = false;
    return obj;
  }
  results.forEach((piece: string, index: number) => {
    if (index < 1 || index > 7 || !piece) { return; }
    if (!obj.user) {
      obj.user = piece;
    } else if (!obj.time || obj.time.time < 1) {
      if (!obj.time) {
        obj.time = new Time();
      }
      if (Constants.regex.MUTE.IS_JUST_NUMBER.test(piece)) {
        obj.time.add("m", Number(piece));
        return;
      }
      const parsedTime = parseTimeStr(piece);
      for (const [unit, amount] of Object.entries(parsedTime)) {
        if (Time.validUnit(unit)) {
          obj.time.add(unit, amount);
        }
      }
    }
  });
  obj.reason = results[8] || "";
  return obj;
}
/**
 * Check all mutes and unmute / add muted role if needed.
 * @returns {Promise<void>}
 */
export async function checkMutes(): Promise<void> {
  if (!bot.readyTimestamp) { return; }
  const mutes: Array<{[prop: string]: any}> = await models.activemutes.findAll();
  const mutesForShard = mutes.filter((mute) => bot.guilds.has(mute.serverid));
  for (const mute of mutesForShard) {
    const guild = bot.guilds.get(mute.serverid);
    if (!guild) { continue; }
    const member = guild.members.get(mute.userid);
    if (!member) { continue; }
    const mutesForGuild: {[prop: string]: any} = await models.mutes.findOne({ where: { serverid: guild.id } });
    if (!mutesForGuild) { continue; }
    const muteRole = guild.roles.get(mutesForGuild.muteRoleID);
    if (!muteRole || mute.permanent || !mute.timestamp || isNaN(mute.timestamp)) { continue; }
    const botmember = guild.members.get(bot.user.id);
    const now = Date.now();
    const escapedName = escMarkdown(guild.name);
    if (now >= mute.timestamp) {
      mute.destroy();
      if (member.roles.has(muteRole.id)) {
        member.removeRole(muteRole).then(() => {
          member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
          .catch(rejct);
        }).catch((err: any) => {
          if (!botmember.hasPermission(["MANAGE_ROLES"])) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to having no \`Manage Roles\` permission. :frowning:`);
          } else if (botmember.highestRole.position < muteRole.position) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being higher than my highest role. \
:frowning:`);
          } else if (botmember.highestRole.id === muteRole.id) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being  my highest role. :frowning:`);
          }
        });
      } else {
        member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
        .catch(rejct);
      }
    } else if (!member.roles.has(muteRole.id)) {
      member.addRole(muteRole)
      .catch(rejct);
    }
  }
}
