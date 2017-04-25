"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("./classes/permissions");
const sequelize_1 = require("./sequelize/sequelize");
const deps_1 = require("./util/deps");
const funcs_1 = require("./util/funcs");
const doError = deps_1.logger.error;
exports.default = async (msg) => {
    const input = msg.content;
    const chanel = msg.channel;
    const message = msg;
    const upparcaso = input.toUpperCase();
    const gueldid = message.guild ? message.guild.id : null;
    let thingy;
    try {
        thingy = msg.guild ? (await sequelize_1.prefixes.findOne({ where: { serverid: msg.guild.id } })) || "+" : "+";
    }
    catch (err) {
        deps_1.logger.error(`Error at Command Handler (await/thingy): ${err}`);
        return;
    }
    let prefix;
    if (thingy) {
        prefix = thingy.prefix || thingy;
    }
    deps_1.logger.debug(prefix);
    let mentionfix;
    if (/^<@!?244533925408538624>\s?/i.test(input)) {
        if (!(/^<@!?244533925408538624>\s?/i.test(prefix))) {
            mentionfix = input.match(/^(<@!?244533925408538624>\s?)/)[1];
        }
    }
    const disabledreply = (pt) => message.reply(":lock: That command has been disabled for this " + pt + "!");
    const checkRole = async (role, member) => {
        if (["mod", "admin"].includes(role)) {
            role = role === "mod" ? "moderator" : "administrator";
        }
        if (!gueldid) {
            return false;
        }
        const result = await sequelize_1.moderation.findOne({ where: { serverid: gueldid } });
        if (!result || !result[role]) {
            return false;
        }
        if (member.roles && member.roles.get(result[role])) {
            return true;
        }
        return false;
    };
    const checkPerm = (node, author = message.member, isDefault = false) => {
        if (author instanceof discord_js_1.User) {
            const oldAuthor = author;
            author = message.guild.members.get(author.id);
            if (!author) {
                throw new Error(`Invalid member: ${oldAuthor.username}`);
            }
        }
        return permissions_1.default.hasPerm(author, gueldid, node, isDefault);
    };
    const theGrandObject = {
        checkPerm, disabledreply, checkRole, prefix, gueldid, mentionfix, upparcaso, input, chanel, msg,
        channel: chanel, guildid: gueldid, inputUpCase: upparcaso, send: chanel.send.bind(chanel),
        reply: msg.reply.bind(msg), message: msg, content: msg.content,
    };
    if (msg.channel.type === "text" && !(msg.author.bot)) {
        (() => {
            // start of text channel part
            theGrandObject.botmember = msg.guild.member(deps_1.bot.user);
            // require("./misc/autoSaver.js")(msg, gueldid);
            if (/^\+prefix/i.test(input)) {
                const instruction = input.replace(/^\+/i, "");
                theGrandObject.instruction = instruction;
                theGrandObject.args = instruction.replace(/^prefix\s*/i, "").length < 1 ? null : instruction.replace(/^prefix\s*/i, "");
                theGrandObject.arrargs = theGrandObject.args ? theGrandObject.args.split ` ` : null;
                return deps_1.bot.commands.prefix.func(message, theGrandObject);
            }
            if (!(upparcaso.startsWith(prefix.toUpperCase()) || /^<@!?244533925408538624>\s?/i.test(upparcaso))) {
                return; // console.log(colors.green("AAAAA"), upparcaso, prefix);
            }
            const instruction = input.replace(new RegExp("^" + deps_1._.escapeRegExp(mentionfix || prefix), "i"), "");
            theGrandObject.instruction = instruction;
            deps_1.logger.debug(instruction);
            for (const cmdn in deps_1.bot.commands) {
                if (deps_1.bot.commands.hasOwnProperty(cmdn)) {
                    const cmd = deps_1.bot.commands[cmdn];
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
                        deps_1.logger.error(`Attemped to load ${cmd.name ? `command ${cmd.name}` : "unnamed command"} but it had no function!`);
                        continue;
                    }
                    if (cmd.name === "prefix") {
                        continue;
                    }
                    const exeFunc = async () => {
                        let disabled;
                        try {
                            disabled = await permissions_1.default.isDisabled(gueldid, chanel.id, cmd.name); // is disabled?
                        }
                        catch (err) {
                            return funcs_1.rejct(err);
                        }
                        if (disabled) {
                            return message.reply(":lock: That command is disabled for this " + disabled + "!");
                        }
                        const zeperms = cmd.perms;
                        if (zeperms) {
                            const usedpermissions = typeof zeperms === "string" ?
                                {} :
                                funcs_1.cloneObject(zeperms); // what we are going to use
                            if (typeof zeperms === "string") {
                                usedpermissions[zeperms] = !!cmd.default; // if it's a string (a single perm) then set it
                            }
                            const parsedPerms = {}; // parsed perms
                            for (const permission in usedpermissions) {
                                if (usedpermissions.hasOwnProperty(permission)) {
                                    const isDefault = usedpermissions[permission];
                                    try {
                                        parsedPerms[permission] = await permissions_1.default.hasPerm(msg.member, gueldid, permission, typeof isDefault === "boolean" ? isDefault : !!isDefault.default); // check perm
                                    }
                                    catch (err) {
                                        parsedPerms[permission] = false; // error :(
                                        deps_1.logger.custom(err, `[ERR/PERMCHECK]`, "red", "error");
                                    }
                                    parsedPerms[permission] = !!parsedPerms[permission];
                                }
                            }
                            theGrandObject.perms = parsedPerms;
                        }
                        theGrandObject.args = instruction.replace(`^${deps_1._.escapeRegExp(cmd.name)}\\s*`, "i").length < 1 ?
                            null :
                            instruction.replace(`^${deps_1._.escapeRegExp(cmd.name)}\s*`, "i");
                        theGrandObject.arrArgs = theGrandObject.args ? theGrandObject.args.split ` ` : null; // array args
                        let result;
                        try {
                            result = cmd.func(message, theGrandObject); // execute command
                        }
                        catch (err) {
                            return doError(err);
                        }
                        if (result instanceof Promise) {
                            result.catch(funcs_1.rejct);
                        }
                    };
                    // console.log(chalk.green("[DEBUG 101]"), new RegExp(`^${_.escapeRegExp(cmd.name)}(?:\\s*[^]+)?$`, "i"));
                    if (cmd.pattern && cmd.pattern instanceof RegExp ? cmd.pattern.test(instruction) : cmd.pattern === instruction
                        || (new RegExp(`^${deps_1._.escapeRegExp(cmd.name)}(?:\s*[^]+)?$`, "i")).test(instruction)) {
                        return exeFunc().catch(funcs_1.rejct);
                    }
                }
            }
            // end of text channel part
        })();
    }
};
