import * as assert from "assert";
import * as chalk from "chalk";
import * as Discord from "discord.js";
import msgEmbedToRich from "discordjs-embed-converter";
import * as fs from "fs";
import * as klawSync from "klaw-sync";
const klaw: typeof klawSync.klawSync = (klawSync as any);
import * as _ from "lodash";
import * as querystring from "querystring";
import * as Sequelize from "sequelize";
import * as toml from "toml";
import xreg = require("xregexp");
export const data = toml.parse(fs.readFileSync("../data.toml", "utf8"));
export const sql = new Sequelize("botdata", data.sql.user || null, data.sql.pass || null, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});
import * as util from "util";

import * as Constants from "../misc/constants";
import decodeT from "../misc/decodeT";

import Command from "../classes/command";
import CommandClient from "../classes/commandClient";
import logger from "../classes/logger";
import messager from "../classes/messager";
import perms from "../classes/permissions";
import Searcher from "../classes/searcher";
import Time from "../classes/time";

import * as models from "../sequelize/sequelize";

// declare const decodeT: (...a) => any;
const commandParse: any = 1; // unused

// let obj: {[prop: string]: any} = {};
export * from "./bot";
// export * from "./db";

export const ownerID: string = "180813971853410305";

export const colors = chalk;

import commandHandler from "../commandHandler";

export const commandHandle = commandHandler;
export const commandParser = commandParse;

/* tslint:disable:object-literal-sort-keys */
// obj = Object.assign(obj, {
export {
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
  Sequelize,
  util,
  messager,
  models,
  perms,
  logger,
  chalk,
  querystring,
  Searcher,
  Time,
  xreg,

  decodeT,
  msgEmbedToRich,
}; // );
/* tslint:enable:object-literal-sort-keys */
