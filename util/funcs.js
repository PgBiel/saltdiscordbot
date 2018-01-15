function applyFuncs() { // this is first to fix resolving issue
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
}
exports.applyFuncs = applyFuncs;

const { Guild } = require("discord.js");
const {
  _, bot, Command, commandParse, Constants, db, Discord, fs, logger, messager, rethink, Time, util,
  xreg, moment, Interval
} = require("./deps");

const { HelperVals } = require("../misc/tableValues");

/* export interface IMessagerEvalData {
  content: string;
  vars: {[prop: string]: any};
  id: number;
}

export interface IMuteParseResults {
  ok: boolean;
  user: string;
  time: Time;
  reason: string;
} */

/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @param {*} [prefix] Text to use before the error message
 * @returns {void}
 */
function rejct(reject, prefix) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(prefix + (reject && reject.stack ? reject.stack : reject), { prefix: "[ERR/REJECT]", color: "red", type: "error" });
}
exports.rejct = rejct;

/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @returns {*} The required value
 */
function ncrequire(fpath) {
  delete require.cache[require.resolve(fpath)];
  return require(fpath);
}
exports.ncrequire = ncrequire;

function datecomp(num = Date.now()) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
    var curTime = new Date(num).toUTCString().split` `;
    curTime.shift();
    var day = Number(curTime.shift()).toString(32);
    var month = months.indexOf(curTime.shift()).toString(13);
    var year = (Number(curTime.shift()) - 2018).toString(36);
    var rest = curTime.shift().split`:`;
    var hour = Number(rest.shift()).toString(24);
    var minute = Number(rest.shift()).toString(36);
    return day + month + year + hour + minute;
}
function dateuncomp(str) {
    var ret = new Date(0);
    var stuff = str.split``;
    ret.setUTCDate(parseInt(stuff.shift(), 32));
    ret.setUTCMonth(parseInt(stuff.shift(), 13));
    ret.setUTCFullYear(parseInt(stuff.shift(), 36) + 2018);
    ret.setUTCHours(parseInt(stuff.shift(), 24), parseInt(stuff.join``, 36));
    return ret;
}
exports.datecomp = datecomp;
exports.dateuncomp = dateuncomp;

/**
 * Factory function for event function for doEval on messager
 * @param {*} evaler The eval function
 * @returns {Function} The generated function
 */
function messagerDoEval(evaler) {
  /**
   * Event function for doEval on messager
   * @param {*} data Data
   * @returns {void}
   */
  return async data => {
    // tslint:disable:no-shadowed-variable
    const { bot, message, msg, input, channel, guild, deps, funcs, guildId, send, reply, db, context } = data.vars;
    const { _, Storage, util } = deps;
    const { member, author } = context;
    // tslint:enable:no-shadowed-variable
    let cont = data.content;
    try {
      const result = eval(cont); // tslint:disable-line:no-eval
      messager.emit(`${data.id}eval`, {
        success: true,
        result
      });
    } catch (err) {
      messager.emit(`${data.id}eval`, {
        success: false,
        result: err
      });
    }
  };
}
exports.messagerDoEval = messagerDoEval;
function djsDebug(info) {
  logger.custom(info, {
      prefix: `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`,
      color: "magenta"
  });
}
exports.djsDebug = djsDebug;
function djsWarn(info) {
  logger.custom(info, { prefix: `[DJS WARN]`, color: "yellow" });
}
exports.djsWarn = djsWarn;
function processMessage(data) {
  logger.debug("Received message");
}
exports.processMessage = processMessage;
/**
 * Clone an object.
 * @param {*} objec The object.
 * @returns {*} The cloned object.
 */
function cloneObject (objec) {
  return Object.assign(Object.create(objec), objec);
}
exports.cloneObject = cloneObject;
/**
 * Loads commands.
 * @returns {void}
 */
function loadCmds() {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const loadedCmds = ncrequire("../commands/cmdIndex").commands;
  for (const cmdn in loadedCmds) {
    if (loadedCmds.hasOwnProperty(cmdn)) {
      const cmd = loadedCmds[cmdn];
      // const parsed = commandParse(loadedCmds[cmd]);
      // if (parsed) {
      bot.commands[cmd.name] = cmd;
      // }
    }
  }
}
exports.loadCmds = loadCmds;
// tslint:disable-next-line:prefer-const
let isUnique = err => err == null ? false : err.name === Constants.sql.UNIQUE_CONSTRAINT;
function SQLLogger(...stuff) {
  return logger.custom(stuff.join(" "), { prefix: "[SQL]", color: "yellow" });
}
exports.SQLLogger = SQLLogger;
function doError(...stuff) {
  return logger.error.apply(logger, [...stuff]);
}
exports.doError = doError;
function bcEval() {
  return bot.shard.broadcastEval.apply(bot.shard, Array.from(arguments));
}
exports.bcEval = bcEval;
/**
 * Get a random value between two numbers.
 * @param {number} min The minimum number.
 * @param {number} max The maximum number.
 * @returns {number}
 */
function random(min, max) {
  if (isNaN(min) || isNaN(max)) {
    return;
  }
  [min, max] = [Math.ceil(Number(min)), Math.floor(Number(max))];
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.random = random;
/**
 * Escape Discord markdown in a string.
 * @param {string} str The string.
 * @param {boolean} [escaper=false] If backslash should be escaped.
 * @returns {string} The newly escaped string.
 */
function escMarkdown(str, escaper = false) {
  const regex = new RegExp(`[\`*_~${escaper ? "\\\\" : ""}]`, "g");
  return str.replace(regex, piece => "\\" + piece);
}
exports.escMarkdown = escMarkdown;
/**
 * Abstract strings if it is too long.
 * @param {string} text The string to abstract.
 * @param {number} length The max length.
 * @returns {string} The abstracted string.
 */
function textAbstract(text, length) {
    if (text == null) {
      return "";
    }
    if (typeof text !== "string") {
      text = String(text);
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
exports.textAbstract = textAbstract;
/**
 * Combine regexs into one.
 * @param {RegExp[]|string[]} regs The RegExp expressions or strings.
 * @param {string} [options] The flags.
 * @returns {RegExp} The combined regex.
 */
function combineRegex(regs, options) {
  let regexStr = "";
  for (const match of regs) {
    regexStr += match instanceof RegExp ? match.source : match;
  }
  return new RegExp(regexStr, options);
}
exports.combineRegex = combineRegex;

/**
 * Parse a time string. (Used for mute command)
 * @param {string} str The time string.
 * @returns {Object} The parsed time, with all units as a property.
 */
function parseTimeStr(str) {
  logger.debug(str);
  const time = new Interval();
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
      _.trim(result).match(Constants.regex.MUTE.SINGLE_TIME_MATCH(true))[1],
      _.trim(result).match(Constants.regex.MUTE.SINGLE_TIME_MATCH(false))[1]
    ];
    if (Interval.validUnit(unit)) {
      time.add(unit, Number(amount));
    }
  }
  return time.units;
}
exports.parseTimeStr = parseTimeStr;

/**
 * Make a mute role.
 * @param {Guild} guild The guild to create the mute role at.
 * @returns {Promise<Role>} The created role.
 */
async function createMutedRole(guild) {
  const newRole = await guild.createRole({
    name: "SaltMuted",
    permissions: []
  });
  for (const [id, channel] of guild.channels) {
    channel.overwritePermissions(newRole, { SEND_MESSAGES: false }).catch(rejct);
  }
  return newRole;
}
exports.createMutedRole = createMutedRole;

/**
 * Convert a string to binary.
 * @param {string} str The string to convert.
 * @param {string} [joinChar] The character to separate each separate digit. " " by default.
 * @param {string} [unicodeJoinChar] The character to separate each character used to make one bigger character.
 * Nothing by default.
 * @returns {string} The converted string.
 */
function toBin(str, joinChar = " ", unicodeJoinChar = "") {
  const PADDING = "0".repeat(8);

  const resultArr = [];

  if (typeof str !== "string") {
    str = String(str);
  }

  for (const i of Object.keys(str)) {
    if (isNaN(Number(i))) {
      return;
    }
    const compact = str.charCodeAt(Number(i)).toString(2);
    if (compact.length / 8 > 1) {
      const el = [];
      compact.match(/[^]{8}/g).forEach(byte => {
        const padded2 = PADDING.substring(0, PADDING.length - byte.length) + byte;
        el.push(padded2);
      });
      resultArr.push(el.join(unicodeJoinChar || ""));
      continue;
    }
    const padded = PADDING.substring(0, PADDING.length - compact.length) + compact;
    resultArr.push(padded);
  }
  const result = resultArr.join(joinChar);
  return result;
}
exports.toBin = toBin;

/**
 * Parse arguments for the mute command.
 * @param {string} str The arguments.
 * @returns {Object} The result.
 */
function parseMute(str) {
  const obj = {
    ok: true,
    user: "",
    time: null,
    reason: ""
  };
  const reg = xreg(Constants.regex.MUTE.MATCH_REG, "xi");
  const results = str.match(reg);
  if (!results) {
    obj.ok = false;
    return obj;
  }
  results.forEach((piece, index) => {
    if (index < 1 || index > 7 || !piece) { return; }
    if (!obj.user) {
      obj.user = piece;
    } else if (!obj.time || obj.time.time < 1) {
      if (!obj.time) {
        obj.time = new Interval();
      }
      if (Constants.regex.MUTE.IS_JUST_NUMBER.test(piece)) {
        obj.time.add("m", Number(piece));
        return;
      }
      const parsedTime = parseTimeStr(piece);
      for (const [unit, amount] of Object.entries(parsedTime)) {
        if (Interval.validUnit(unit)) {
          obj.time.add(unit, amount);
        }
      }
    }
  });
  obj.reason = results[10] || "";
  return obj;
}
exports.parseMute = parseMute;
/**
 * Check all mutes and unmute / add muted role if needed.
 * @returns {Promise<void>}
 */
async function checkMutes() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("activemutes").storage());
  const mutesForShard = _.flatten(
    awaited
    .filter((mute, guildId) => bot.guilds.has(guildId.toString()))
    .array()
    .map(([guildId, vals]) => _.flatten(vals.map(val => Object.assign({ serverid: guildId }, val, { old: val }))))
  );
  for (const mute of mutesForShard) {
    const guildId = mute.serverid;
    const guild = bot.guilds.get(guildId);
    if (!guild) continue;
    const member = guild.members.get(uncompress(mute.userid));
    if (!member) continue;
    const mutesForGuild = await (db.table("mutes").get(guildId));
    if (!mutesForGuild) continue;
    const muteRole = guild.roles.get(uncompress(mutesForGuild.muteRoleID));
    const timestamp = (dateuncomp(mute.timestamp) || { getTime: () => NaN }).getTime();
    if (
      !muteRole
      || mute.permanent
      || timestamp == null
      || isNaN(timestamp)) continue;
    const botmember = guild.members.get(bot.user.id);
    const now = Date.now();
    const escapedName = escMarkdown(guild.name);
    if (now >= timestamp) {
      db.table("activemutes").remArr(guild.id, mute.old);
      if (member.roles.has(muteRole.id)) {
        member.removeRole(muteRole).then(() => {
          member.send(`Your mute in the server **${escapedName}** has been automatically lifted.`)
          .catch(rejct);
        }).catch(err => {
          if (!botmember.hasPermission(["MANAGE_ROLES"])) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to having no \`Manage Roles\` permission. :frowning:`).catch(rejct);
          } else if (botmember.highestRole.position < muteRole.position) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being higher than my highest role. \
:frowning:`).catch(rejct);
          } else if (botmember.highestRole.id === muteRole.id) {
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you due to the mute role being my highest role. :frowning:`).catch(rejct);
          } else {
            rejct(err, "At mute auto-remove role:");
            member.send(`Your mute in the server **${escapedName}** has been automatically lifted. \
However, I was unable to take the role away from you for an yet unknown reason. :frowning:`).catch(rejct);
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

async function checkWarns() {
  if (!bot.readyTimestamp) return;
  const awaited = await (db.table("warns").storage());
  const warnsForShard = _.flatten(
    awaited
    .filter((mute, guildId) => bot.guilds.has(guildId.toString()))
    .array()
    .map(([guildId, vals]) => _.flatten(vals.map(val => Object.assign({ serverid: guildId }, val, { old: val }))))
  );
  for (const warn of warnsForShard) {
    const guildId = warn.serverid;
    const guild = bot.guilds.get(guildId);
    if (!guild) continue;
    const member = guild.members.get(uncompress(warn.userid));
    if (!member) continue;
    const expire = durationdecompress(await (db.table("warnexpires").get(guildId)));
    if (!expire) continue;
    const warnedAt = dateuncomp(warn.warnedat);
    if (warnedAt == null) continue;
    const time = moment(warnedAt).add(expire).toDate().getTime();
    if (Date.now() >= time) db.table("warns").remArr(guildId, warn.old);
  }
}

exports.checkMutes = checkMutes;
exports.checkWarns = checkWarns;

/**
 * Capitalize the first letter in a string.
 * @param {string} str The string
 * @param {boolean} all If all initial letters (each space) should be capitalized
 * @returns {string} The modified string
 */
function capitalize(str, all = false) {
  if (all) {
    return str.replace(/(?:^|\s+)([\s\S])/g, char => char.toUpperCase());
  }
  return str.replace(/^([\s\S])/, char => char.toUpperCase());
}
exports.capitalize = capitalize;

/**
 * Paginate text.
 * @param {string} text The text
 * @param {number} [wordCount=10] Amount of words per page
 * @param {regex} [split=/(?:([\w;,..")(\-\d]+)\s*){n}/ig] The string/regex to split by, replaces [n] by wordCount
 * @returns {string[]}
 */
function paginate(text, wordCount = 10, regex = /((?:(?:[\w;,..\")(\-\d]+)\s+){1,[n]})([\w;,..\")(\-\d]+)|([\w;,..\")(\-\d]+)/ig) {
  /* *** old version *** */
  /* const words = text.split(split);
  const arr = [[]];
  for (let i = 1, ii = 0; i < words.length + 1; i++) {
    const ind = i - 1;
    arr[ii].push(words[ind]);
    if (i % wordCount === 0 && i < words.length) arr[++ii] = [];
  }
  return arr.map(a => a.join(join)); */
  /* *** new version *** */
  const regexToUse = new RegExp(regex.toString().replace(/^\/|(\/[a-z]+)$/g, "").replace(/\[n\]/, `${wordCount - 1}`), regex.flags);
  return text.match(regexToUse);
}
exports.paginate = paginate;

/**
 * Add specified char if not present.
 * @param {string} text The text
 * @param {string} [char=" "] The character to ensure it ends with
 * @returns {string} The modified text
 */
function endChar(text, char = " ") {
  return text.endsWith(char) ? text : text + char;
}
exports.endChar = endChar;

function botMessage(msg) {
  const thingy = require("../commandHandler")(msg);
  if (thingy.catch) {
    thingy.catch(rejct);
  }
}
exports.botMessage = botMessage;

function compress(str) {
  str = String(str);
  if (str.length == 1) {
    return str;
  }
  if (str.length % 2 != 0) {
    str = "0" + str;
  }
  return Buffer.from(str, "hex").toString("base64").replace(/=/g, "");
}
function uncompress(str) {
  str = String(str);
  if (str.length == 1) {
    return str;
  }
  var ret = Buffer.from(str + "=".repeat(str.length % 4), "base64").toString("hex");
  if (ret[0] == "0") {
    ret = ret.substr(1);
  }
  return ret;
}
exports.compress = compress;
exports.uncompress = uncompress;

function avatarCompress(url) {
  var end;
  if (url.match("embed")) {
    end = "-" + url.match(/(\w+).[a-z]+?$/)[1];
  } else {
    end = url.match(/(\w+)\.[a-z]+?$/)[1];
  }
  if (end.match(/^a_/)) {
    return "g" + compress(end.substr(2));
  }
  return compress(end);
}

function avatarUncompress(end, id) {
  if (end[0] == "-") {
    return `https://cdn.discordapp.com/embed/avatars/${end[1]}.png`;
  }
  if (end[0] == "g") {
    return `https://cdn.discordapp.com/avatars/${id}/a_${uncompress(end.substr(1))}.gif`;
  } else {
    return `https://cdn.discordapp.com/avatars/${id}/${uncompress(end)}.webp`;
  }
}

exports.avatarCompress = avatarCompress;
exports.avatarUncompress = avatarUncompress;

/**
 * Compress a duration.
 * @param {string|Interval} dur
 * @returns {string}
 */
function durationcompress (dur) {
  let mo;
  if (dur instanceof Interval) {
    mo = dur.duration;
  } else {
    dur = String(dur);
    mo = moment.duration(dur);
  }
  const temp = mo.hours();
  mo.subtract(Math.floor(temp / 24) * 24, "hours");
  mo.add(Math.floor(temp / 24), "days");
  const stuff = [mo.months() + mo.years() * 12, mo.days(), mo.hours(), mo.minutes(), mo.seconds()];
  const symbols = "abcde".split``;
  return compress(stuff.map((v, i) => v ? v + symbols[i] : "").join``);
}

/**
 * Decompresses a duration.
 * @param {string} comp 
 * @returns {Duration}
 */
function durationdecompress (comp) {
  const str = uncompress(comp);
  return moment.duration({
    months: (str.match(/(\d+)a/) || "")[1],
    days: (str.match(/(\d+)b/) || "")[1],
    hours: (str.match(/(\d+)c/) || "")[1],
    minutes: (str.match(/(\d+)d/) || "")[1],
    seconds: (str.match(/(\d+)e/) || "")[1]
  });
}

exports.durationcompress = durationcompress;
exports.durationdecompress = durationdecompress;

/* function avatarCompress(link) {
  const avatarPart = /^(?:https?:\/\/)?cdn\.discordapp\.com\/avatars\/\d+\/(\w+\.(?:jpe?g|png|gif|webp))(?:\?size=\d+)?$/i;
  const defAvatar = /^(?:https:\/\/)?cdn\.discordapp\.com\/embed\/avatars\/(\d+)\.(?:jpe?g|png|gif|webp)(?:\?size=\d+)?$/i;
  if (link.match(avatarPart)) {
    return link.match(avatarPart)[1];
  } else if (link.match(defAvatar)) {
    return "-" + link.match(defAvatar)[1];
  } else {
    return link;
  }
}
function avatarUncompress(compressed, id) {
  if (/^(?:https:\/\/)?cdn\.discordapp\.com/i.test(_.trim(compressed))) {
    return compressed;
  } else if (/^\-\d+$/.test(_.trim(compressed))) {
    return `https://cdn.discordapp.com/embed/avatars/${_.trim(compressed).match(/^\-(\d+)$/)[1]}.png`;
  } else {
    return `https://cdn.discordapp.com/avatars/${id}/${_.trim(compressed)}`;
  }
} */
