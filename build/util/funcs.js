"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deps_1 = require("./deps");
/**
 * Handle a rejection
 * @param {*} rejection The rejection to handle
 * @returns {void}
 */
exports.rejct = (rejection) => {
    deps_1.logger.custom(rejection, "[ERR/REJECT]", "red", "error");
};
/**
 * Require without being on cache
 * @param {string} fpath The path to require
 * @returns {*} The required value
 */
exports.ncrequire = (fpath) => {
    delete require.cache[require.resolve(fpath)];
    return require(fpath);
};
/**
 * Factory function for event function for doEval on messager
 * @param {*} evaler The eval function
 * @returns {function} The generated function
 */
exports.messagerDoEval = (evaler) => {
    /**
     * Event function for doEval on messager
     * @param {*} data Data
     * @returns {void}
     */
    return (data) => {
        const { message, gueldid, input, chanel } = data.vars;
        try {
            deps_1.messager.emit(`${data.id}eval`, {
                success: true,
                result: eval(data.content),
            });
        }
        catch (err) {
            deps_1.messager.emit(`${data.id}eval`, {
                success: false,
                result: err,
            });
        }
    };
};
function djsDebug(info) {
    deps_1.logger.custom(info, `[${/^(?:Sending heartbeat|Heartbeat acknowledged)$/i.test(info) ? "HEARTBEAT" : "DJS DEBUG"}]`, "magenta");
}
exports.djsDebug = djsDebug;
function djsWarn(info) {
    deps_1.logger.custom(info, `[DJS WARN]`, "yellow");
}
exports.djsWarn = djsWarn;
function botMessage(msg) {
    const thingy = deps_1.commandHandler(msg);
    if (thingy.catch) {
        thingy.catch(exports.rejct);
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
function loadCmds() {
    const loadedCmds = [];
    deps_1.fs.readdirSync("./commands").map((f) => {
        if (/\.js$/.test(f)) {
            loadedCmds.push(exports.ncrequire(`../commands/${f}`));
        }
    });
    for (const cmd in loadedCmds) {
        if (loadedCmds.hasOwnProperty(cmd)) {
            const parsed = deps_1.commandParse(loadedCmds[cmd]);
            if (parsed) {
                deps_1.bot.commands[parsed.name] = parsed;
            }
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
