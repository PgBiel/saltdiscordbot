"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../classes/command");
const database_1 = require("../../classes/database");
// import { prefixes } from "../../sequelize/sequelize";
const deps_1 = require("../../util/deps");
const func = async (msg, { guildId, reply, send, args, arrArgs, prefix: p, hasPermission, perms }) => {
    if (arrArgs.length < 1) {
        const prefixUsed = database_1.default.table("prefixes").get(guildId) || "+";
        return send(`Current prefix for this server: ${prefixUsed}`);
    }
    deps_1.logger.debug("prefix:", arrArgs.toString());
    if (!hasPermission(["MANAGE_GUILD"]) && !perms.prefix) {
        return reply("You do not have `Manage Server` (nor a permission overwrite).");
    }
    database_1.default.table("prefixes").set(guildId, args);
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
