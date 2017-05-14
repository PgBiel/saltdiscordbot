"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const database_1 = require("../classes/database");
const sequelize_1 = require("../sequelize/sequelize");
const deps_1 = require("../util/deps");
const func = async (msg, { guildId, reply, send, args, arrArgs, prefix, hasPermission, perms }) => {
    if (arrArgs.length < 1) {
        let prefixUsed = (await database_1.default.find(sequelize_1.prefixes, { where: { serverid: guildId } })) || "+";
        if (prefixUsed.prefix) {
            prefixUsed = prefixUsed.prefix;
        }
        return send(`Current prefix for this server: ${prefixUsed}`);
    }
    deps_1.logger.debug("prefix:", arrArgs.toString());
    if (!hasPermission(["MANAGE_GUILD"]) && !perms.prefix) {
        return reply("You do not have `Manage Server` (nor a permission overwrite).");
    }
    const result = await database_1.default.findAdd(sequelize_1.prefixes, { where: { serverid: guildId }, defaults: { prefix: args } });
    if (!result[1]) {
        result[0].update({ prefix: args });
    }
    send(`Prefix set to \`${args}\`!`);
};
exports.prefix = new command_1.default({
    func,
    name: "prefix",
    perms: "prefix",
    description: "Set the prefix of the bot for the server. This always has the prefix +.\
   This also requires, without extra permissions, at least `Manage Server`.",
    example: "+prefix +",
    category: "Administration",
    customPrefix: "+",
    args: { "new prefix": true },
    guildOnly: true,
});
