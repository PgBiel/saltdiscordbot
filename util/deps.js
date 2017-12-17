const assert = require("assert");
const chalk = require("chalk");
const Discord = require("discord.js");
const msgEmbedToRich = require("discordjs-embed-converter");
const fs = require("fs");
const klaw = require("klaw-sync");
const _ = require("lodash");
const querystring = require("querystring");
// const Sequelize = require("sequelize");
const rethink = require("rethinkdb");
const toml = require("toml");
// const rethinkSetup = require("../misc/rethinkSetup");
const xreg = require("xregexp");
exports.data = toml.parse(fs.readFileSync("../data.toml", "utf8"));
/* export const sql = new Sequelize("botdata", data.sql.user || null, data.sql.pass || null, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
}); */
const a = 1;
/* export let r: rethink.Db;
rethink.connect({ host: "localhost", port: 28015 }).then((c) => {
  conn = c;
  r = rethink.db("saltbot");
  rethinkSetup(r, c);
}).catch((err) => { throw err; }); */
const util = require("util");

const Constants = require("../misc/constants");
const decodeT = require("../misc/decodeT");

const Command = require("../classes/command");
const CommandClient = require("../classes/commandClient");
const logger = require("../classes/logger");
const messager = require("../classes/messager");
const perms = require("../classes/permissions");
const Searcher = require("../classes/searcher");
const Time = require("../classes/time");

// const models = require("../sequelize/sequelize");

// declare const decodeT: (...a) => any;
const commandParse = 1; // unused

// let obj: {[prop: string]: any} = {};
exports.bot = require("./bot").bot;

exports.Storage = require("saltjs").Storage;
// export * from "./db";

exports.ownerID = "180813971853410305";

exports.colors = chalk;

const commandHandler = require("../commandHandler");

exports.commandHandle = commandHandler;
exports.commandParser = commandParse;

exports.db = require("../classes/database").db;

/* tslint:disable:object-literal-sort-keys */
// obj = Object.assign(obj, {
Object.entries({
  _,
  assert,
  Command,
  commandHandler,
  commandParse,
  Constants,
  Discord,
  fs,
  toml,
  klaw,
  // Sequelize,
  util,
  messager,
  perms,
  logger,
  chalk,
  querystring,
  Searcher,
  Time,
  xreg,
  rethink,

  decodeT,
  msgEmbedToRich,
}).forEach(([key, val]) => {
  exports[key] = val;
}); // );
/* tslint:enable:object-literal-sort-keys */
