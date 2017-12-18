const { Guild } = require("discord.js");
const Command = require("../classes/command");
const {
  _, bot, commandParse, Constants, db, Discord, fs, logger, messager, rethink, Time, util,
  xreg
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
function rejct(rejection, prefix) {
  // console.log(require("util").inspect(require("./deps")));
  logger.custom(prefix + rejection, { prefix: "[ERR/REJECT]", color: "red", type: "error" });
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
  return data => {
    // tslint:disable:no-shadowed-variable
    const { bot, message, msg, input, channel, guild, deps, funcs, guildId, send, reply, db, context } = data.vars;
    const { _, Storage, util } = deps;
    const { member, author } = context;
    // tslint:enable:no-shadowed-variable
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
exports.messagerDoEval = messagerDoEval;
function djsDebug(info) {
  logger.custom(info, {
      prefix: `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`,
      color: "magenta",
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
 * @returns {?Object} The parsed time, with all units as a property.
 */
function parseTimeStr(str) {
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
exports.parseTimeStr = parseTimeStr;

/**
 * Make a mute role.
 * @param {Guild} guild The guild to create the mute role at.
 * @returns {Promise<Role>} The created role.
 */
async function createMutedRole(guild) {
  const newRole = await guild.createRole({
    name: "SaltMuted",
    permissions: [],
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
    reason: "",
  };
  const reg = xreg(Constants.regex.MUTE.MATCH_REG, "x");
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
exports.parseMute = parseMute;
/**
 * Check all mutes and unmute / add muted role if needed.
 * @returns {Promise<void>}
 */
exports.checkMutes = async function checkMutes() {
  if (!bot.readyTimestamp) { return; }
  const mutesForShard = _.flatten(
    db.table("activemutes").storage.filter((mute, guildId) => bot.guilds.has(guildId.toString())).array()
    .map(([guildId, vals]) => _.flatten(vals.map(value => Object.assign({ serverid: guildId }, value, { old: value })))),
  );
  for (const mute of mutesForShard) {
    const guild = bot.guilds.get(mute.serverid);
    if (!guild) { continue; }
    const member = guild.members.get(mute.userid);
    if (!member) { continue; }
    const mutesForGuild = db.table("mutes").get(mute.serverid);
    if (!mutesForGuild) { continue; }
    const muteRole = guild.roles.get(mutesForGuild.muteRoleID);
    const timestamp = Number(mute.timestamp);
    if (
      !muteRole
      || mute.permanent
      || timestamp == null
      || isNaN(timestamp)) { continue; }
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
};

/**
 * Capitalize the first letter in a string.
 * @param {string} str The string
 * @param {boolean} all If all initial letters (each space) should be capitalized
 * @returns {string} The modified string
 */
exports.capitalize = function capitalize(str, all = false) {
  if (all) {
    return str.replace(/(?:^|\s+)([\s\S])/g, char => char.toUpperCase());
  }
  return str.replace(/^([\s\S])/, char => char.toUpperCase());
};

function botMessage(msg) {
  const thingy = require("../commandHandler")(msg);
  if (thingy.catch) {
    thingy.catch(rejct);
  }
}
exports.botMessage = botMessage;
