"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("./deps");
/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @returns {void}
 */
function rejct(rejection) {
    deps_1.logger.custom(rejection, "[ERR/REJECT]", "red", "error");
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
    return (data) => {
        const { bot, message, msg, input, channel, deps, funcs, guildId, send, reply } = data.vars;
        try {
            const result = eval(data.content); // tslint:disable-line:no-eval
            deps_1.messager.emit(`${data.id}eval`, {
                success: true,
                result,
            });
        }
        catch (err) {
            deps_1.messager.emit(`${data.id}eval`, {
                success: false,
                result: err,
            });
        }
    };
}
exports.messagerDoEval = messagerDoEval;
function djsDebug(info) {
    deps_1.logger.custom(info, `[${/heartbeat/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`, "magenta");
}
exports.djsDebug = djsDebug;
function djsWarn(info) {
    deps_1.logger.custom(info, `[DJS WARN]`, "yellow");
}
exports.djsWarn = djsWarn;
function botMessage(msg) {
    const thingy = deps_1.commandHandler(msg);
    if (thingy.catch) {
        thingy.catch(rejct);
    }
}
exports.botMessage = botMessage;
function processMessage(data) {
    deps_1.logger.debug("Received message");
}
exports.processMessage = processMessage;
/**
 * Clone an object.
 * @param {*} objec The object.
 * @returns {*} The cloned object.
 */
function cloneObject(objec) {
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
            deps_1.bot.commands[cmd.name] = cmd;
            // }
        }
    }
}
exports.loadCmds = loadCmds;
// tslint:disable-next-line:prefer-const
let isUnique = (err) => err == null ? false : err.name === deps_1.Constants.sql.UNIQUE_CONSTRAINT;
function SQLLogger(...stuff) {
    return deps_1.logger.custom(stuff.join(" "), "[SQL]", "yellow");
}
exports.SQLLogger = SQLLogger;
function doError(...stuff) {
    return deps_1.logger.error.apply(deps_1.logger, [...stuff]);
}
exports.doError = doError;
function bcEval() {
    return deps_1.bot.shard.broadcastEval.apply(deps_1.bot.shard, Array.from(arguments));
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
    return str.replace(regex, (piece) => "\\" + piece);
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
        try {
            text = text.toString();
        }
        catch (err) {
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
exports.textAbstract = textAbstract;
/**
 * Combine regexs into one.
 * @param {RegExp[]|string[]} regs The RegExp expressions or strings.
 * @param {string} [options] The flags.
 * @returns {RegExp} The combined regex.
 */
function combineRegex(regs, options = "") {
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
    deps_1.logger.debug(str);
    const time = new deps_1.Time();
    if (typeof str !== "string") {
        return time.units;
    }
    const match = str.match(deps_1.Constants.regex.MUTE.TIME_MATCH);
    if (!match || match.length < 1) {
        return time.units;
    }
    deps_1.logger.debug(match);
    for (const result of match) {
        const [amount, unit] = [
            result.match(deps_1.Constants.regex.MUTE.SINGLE_TIME_MATCH(true))[1],
            result.match(deps_1.Constants.regex.MUTE.SINGLE_TIME_MATCH(false))[1],
        ];
        if (deps_1.Time.validUnit(unit)) {
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
        try {
            str = str.toString();
        }
        catch (err) {
            str = String(str);
        }
    }
    for (const i of Object.keys(str)) {
        if (isNaN(Number(i))) {
            return;
        }
        const compact = str.charCodeAt(Number(i)).toString(2);
        if (compact.length / 8 > 1) {
            const el = [];
            compact.match(/[^]{8}/g).forEach((byte) => {
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
    const reg = deps_1.xreg(deps_1.Constants.regex.MUTE.MATCH_REG, "x");
    const results = str.match(reg);
    if (!results) {
        obj.ok = false;
        return obj;
    }
    results.forEach((piece, index) => {
        if (index < 1 || index > 7 || !piece) {
            return;
        }
        if (!obj.user) {
            obj.user = piece;
        }
        else if (!obj.time || obj.time.time < 1) {
            if (!obj.time) {
                obj.time = new deps_1.Time();
            }
            if (deps_1.Constants.regex.MUTE.IS_JUST_NUMBER.test(piece)) {
                obj.time.add("m", Number(piece));
                return;
            }
            const parsedTime = parseTimeStr(piece);
            for (const [unit, amount] of Object.entries(parsedTime)) {
                if (deps_1.Time.validUnit(unit)) {
                    obj.time.add(unit, amount);
                }
            }
        }
    });
    obj.reason = results[8] || "";
    return obj;
}
exports.parseMute = parseMute;
