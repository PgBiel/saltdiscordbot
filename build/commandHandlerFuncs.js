"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const actionlogger_1 = require("./classes/actionlogger");
const messager_1 = require("./classes/messager");
const searcher_1 = require("./classes/searcher");
const sequelize_1 = require("./sequelize/sequelize");
const deps = require("./util/deps");
const deps_1 = require("./util/deps");
const funcs = require("./util/funcs");
const funcs_1 = require("./util/funcs");
function returnFuncs(msg) {
    const input = msg.content;
    const channel = msg.channel;
    const message = msg;
    const guildId = msg.guild ? msg.guild.id : null;
    const sendingFunc = (func) => {
        return (content, options) => {
            if (typeof content === "object" && !options && !(content instanceof Array)) {
                options = content;
                content = "";
            }
            else if (!options) {
                options = {};
            }
            const result = func(content, options);
            if (options.autoCatch == null || options.autoCatch) {
                result.catch(funcs_1.rejct);
            }
            return result;
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
        const result = await sequelize_1.moderation.findOne({ where: { serverid: guildId } });
        if (!result || !result[role]) {
            return false;
        }
        if (member.roles && member.roles.get(result[role])) {
            return true;
        }
        return false;
    };
    const promptAmbig = async (members) => {
        let satisfied = false;
        let cancelled = false;
        let currentOptions = [];
        members.forEach((gm) => currentOptions.push(gm));
        const filter = (msg2) => {
            const options = currentOptions;
            if (msg2.author.id !== msg.author.id) {
                return false;
            }
            if (msg2.content === "cancel" || msg2.content === "`cancel`") {
                cancelled = true;
                return true;
            }
            const tagOptions = options.map((gm) => gm.user.tag);
            if (tagOptions.includes(msg2.content)) {
                satisfied = true;
                currentOptions = [options[tagOptions.indexOf(msg2.content)]];
                return true;
            }
            const collOptions = new discord_js_1.Collection();
            options.forEach((gm) => {
                collOptions.set(gm.id, gm);
            });
            const searcher2 = new searcher_1.default({ members: collOptions });
            const resultingMembers = searcher2.searchMember(msg2.content);
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
        for (let i = 0; i < deps_1.Constants.numbers.MAX_PROMPT; i++) {
            try {
                const result = await channel.awaitMessages(filter, {
                    time: deps_1.Constants.times.AMBIGUITY_EXPIRE, maxMatches: 1,
                    errors: ["time"],
                });
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
            }
            catch (err) {
                deps_1.logger.error(`At PromptAmbig: ${err}`);
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
    const hasPermission = msg.member ? msg.member.hasPermission.bind(msg.member) : null;
    const userError = (data) => reply(`Sorry, but it seems there was an error while executing this command.\
    If you want to contact the bot devs, please tell them this information: \`${data}\`. Thanks!`);
    const prompt = async ({ question, invalidMsg, filter, timeout = deps_1.Constants.times.AMBIGUITY_EXPIRE, cancel = true, options = {} }) => {
        let cancelled = false;
        let satisfied = null;
        const filterToUse = (msg2) => {
            if (msg2.content === "cancel" && cancel) {
                return (cancelled = true);
            }
            const result = filter(msg2);
            if (result !== false && result != null) {
                satisfied = msg2;
                return true;
            }
            return false;
        };
        const sentmsg = await send(question, options || {});
        for (let i = 0; i < deps_1.Constants.numbers.MAX_PROMPT; i++) {
            try {
                const msgs = await msg.channel.awaitMessages(filterToUse, { time: timeout, maxMatches: 1, errors: ["time"] });
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
            }
            catch (err) {
                break;
            }
        }
        send("Command cancelled.");
        return "";
    };
    const actionLog2 = (options) => {
        if (!msg.guild) {
            return;
        }
        const newOptions = Object.assign({ guild: msg.guild }, options);
        return actionlogger_1.default.log(newOptions);
    };
    const obj = {
        hasPermission, userError, promptAmbig, checkRole,
        send, reply, prompt, actionLog: actionLog2,
    };
    const doEval = (content) => {
        let objectToUse = funcs_1.cloneObject(obj);
        objectToUse = Object.assign(objectToUse, {
            bot: deps_1.bot, msg, message: msg,
            channel, guildId, deps,
            funcs,
        });
        const data = {
            content,
            id: Date.now(),
            vars: objectToUse,
        };
        return messager_1.default.awaitForThenEmit("doEval", data, data.id + "eval");
    };
    obj.doEval = doEval;
    return obj;
}
exports.default = returnFuncs;
