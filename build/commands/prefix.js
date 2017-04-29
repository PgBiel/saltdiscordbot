"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const database_1 = require("../classes/database");
const sequelize_1 = require("../sequelize/sequelize");
const deps_1 = require("../util/deps");
const func = async (msg, { guildId, reply, send, arrArgs, prefix, hasPermission, perms }) => {
    if (arrArgs.length < 1) {
        return send(`Current prefix for this server: ${prefix}`);
    }
    deps_1.logger.debug("prefix:", arrArgs.toString());
    const thingToUse = arrArgs[0];
    if (!hasPermission("MANAGE_GUILD") && !perms.prefix) {
        return reply("You do not have `Manage Server` (nor a permission overwrite).");
    }
    const result = await database_1.default.findAdd(sequelize_1.prefixes, { where: { serverid: guildId }, defaults: { prefix: thingToUse } });
    if (!result[1]) {
        result[0].update({ prefix: thingToUse });
    }
    send(`Prefix set to \`${thingToUse}\`!`);
};
exports.prefix = new command_1.default({
    func,
    name: "prefix",
    perms: "prefix",
    description: "Set of the bot for the server. This always has the prefix +.\
   This also requires, without extra permissions, at least `Manage Server`.",
    example: "+prefix +",
    category: "Administration",
});
