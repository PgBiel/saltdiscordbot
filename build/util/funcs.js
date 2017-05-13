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
function cloneObject(objec) {
    return Object.assign(Object.create(objec), objec);
}
exports.cloneObject = cloneObject;
/**
 * Loads commands.
 */
function loadCmds() {
    /* const loadedCmds = [];
    fs.readdirSync("./commands").map((f: string) => {
      if (/\.js$/.test(f)) {
        loadedCmds.push(ncrequire(`../commands/${f}`));
      }
    }); */
    const loadedCmds = ncrequire("../commands/cmdIndex");
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
