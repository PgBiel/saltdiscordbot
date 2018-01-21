exports.applyDeps = function applyDeps() {
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
};
// dependencies
exports.db = require("../classes/database");
exports.Storage = require("saltjs").Storage;
exports._ = require("lodash");
exports.burlp = require("burlp");
exports.logger = require("../classes/logger");
exports.moment = require("moment");
exports.transliteration = require("transliteration");
exports.tr = exports.transliteration.transliterate;
exports.slugify = exports.transliteration.slugify;
exports.bot = require("./bot").bot;
exports.tables = require("tables.js");
exports.assert = require("assert");
exports.util = require("util");
exports.chalk = require("chalk");
exports.rethink = require("rethinkdb");
exports.toml = require("toml");
exports.msgEmbedToRich = require("discordjs-embed-converter");
exports.fs = require("fs");
exports.klaw = require("klaw-sync");
exports.querystring = require("querystring");
exports.Discord = require("discord.js");
// multi-prompt
exports.MultiPrompt = require("../classes/multiprompt");
// some Discord utils
exports.Embed = exports.Discord.MessageEmbed;
exports.Message = exports.Discord.Message;
exports.Guild = exports.Discord.Guild;
exports.GuildMember = exports.Discord.GuildMember;
exports.TextChannel = exports.Discord.TextChannel;
// ---
exports.xreg = require("xregexp");
exports.data = exports.toml.parse(exports.fs.readFileSync("./data.toml", "utf8"));
const a = 1;

exports.ownerID = "180813971853410305";

exports.colors = exports.chalk;

// exports.commandHandler = require("../commandHandler");

// exports.commandHandle = exports.commandHandler;
exports.Constants = require("../misc/constants");
exports.decodeT = require("../misc/decodeT");

exports.CommandClient = require("../classes/commandClient");
exports.messager = require("../classes/messager");
exports.perms = require("../classes/permissions");
exports.Searcher = require("../classes/searcher");
exports.Time = require("../classes/time");
exports.Interval = require("../classes/interval");

exports.Command = require("../classes/command");
