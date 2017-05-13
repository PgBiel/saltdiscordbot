"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
exports.assert = assert;
const chalk = require("chalk");
exports.chalk = chalk;
const Discord = require("discord.js");
exports.Discord = Discord;
const discordjs_embed_converter_1 = require("discordjs-embed-converter");
exports.msgEmbedToRich = discordjs_embed_converter_1.default;
const fs = require("fs");
exports.fs = fs;
const _ = require("lodash");
exports._ = _;
const Sequelize = require("sequelize");
exports.Sequelize = Sequelize;
const toml = require("toml");
exports.toml = toml;
exports.data = toml.parse(fs.readFileSync("../data.toml", "utf8"));
exports.sql = new Sequelize("botdata", exports.data.sql.user || null, exports.data.sql.pass || null, {
    host: "localhost",
    dialect: "postgres",
    logging: false,
});
const util = require("util");
exports.util = util;
const Constants = require("../misc/constants");
exports.Constants = Constants;
const decodeT_1 = require("../misc/decodeT");
exports.decodeT = decodeT_1.default;
const command_1 = require("../classes/command");
exports.Command = command_1.default;
const logger_1 = require("../classes/logger");
exports.logger = logger_1.default;
const messager_1 = require("../classes/messager");
exports.messager = messager_1.default;
const permissions_1 = require("../classes/permissions");
exports.perms = permissions_1.default;
const searcher_1 = require("../classes/searcher");
exports.Searcher = searcher_1.default;
const time_1 = require("../classes/time");
exports.Time = time_1.default;
// declare const decodeT: (...a) => any;
const commandParse = 1; // unused
exports.commandParse = commandParse;
// let obj: {[prop: string]: any} = {};
__export(require("./bot"));
exports.ownerID = "180813971853410305";
exports.colors = chalk;
const commandHandler_1 = require("../commandHandler");
exports.commandHandler = commandHandler_1.default;
exports.commandHandle = commandHandler_1.default;
exports.commandParser = commandParse;
/* tslint:enable:object-literal-sort-keys */
