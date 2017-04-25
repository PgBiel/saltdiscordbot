"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
exports.assert = assert;
const chalk = require("chalk");
exports.chalk = chalk;
const Discord = require("discord.js");
exports.Discord = Discord;
const fs = require("fs");
exports.fs = fs;
const _ = require("lodash");
exports._ = _;
const Sequelize = require("sequelize");
exports.Sequelize = Sequelize;
const toml = require("toml");
exports.toml = toml;
const util = require("util");
exports.util = util;
const command_1 = require("../classes/command");
exports.Command = command_1.default;
const commandClient_1 = require("../classes/commandClient");
const logger_1 = require("../classes/logger");
exports.logger = logger_1.default;
const permissions_1 = require("../classes/permissions");
exports.perms = permissions_1.default;
const commandHandler_1 = require("../commandHandler");
exports.commandHandler = commandHandler_1.default;
const Constants = require("../misc/constants");
exports.Constants = Constants;
const decodeT_1 = require("../misc/decodeT");
exports.decodeT = decodeT_1.default;
const Messager_1 = require("../misc/Messager");
exports.messager = Messager_1.default;
// declare const decodeT: (...a) => any;
const commandParse = 1; // unused
exports.commandParse = commandParse;
exports.data = toml.parse(fs.readFileSync("./data.toml", "utf8"));
// let obj: {[prop: string]: any} = {};
exports.bot = new commandClient_1.default({
    disableEveryone: true,
    disabledEvents: ["TYPING_START"],
    fetchAllMembers: true,
});
exports.sql = new Sequelize("botdata", exports.data.sql.user || null, exports.data.sql.pass || null, {
    host: "localhost",
    dialect: "postgre",
    logging: false,
});
exports.ownerID = "180813971853410305";
exports.colors = chalk;
exports.commandHandle = commandHandler_1.default;
exports.commandParser = commandParse;
/* tslint:enable:object-literal-sort-keys */
