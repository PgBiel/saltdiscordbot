export function applyDeps() {
  Object.entries(module.exports).forEach(([k, v]) => this[k] = v);
}
// dependencies
import * as mathjs from "mathjs";
import * as _Storage from "saltjs";
import cross from "../classes/cross";
import db from "../classes/database";
const Storage = _Storage.Storage;

import * as burlp from "burlp";
import * as _ from "lodash";
const https = burlp.https;
const http = burlp.http;

import * as moment from "moment";
import * as transliteration from "transliteration";
import logger from "../classes/logger";
const tr = transliteration.transliterate;
const slugify = transliteration.slugify;

import * as assert from "assert";
import chalk from "chalk";
import * as Discord from "discord.js";
import * as fs from "fs";
import * as klaw from "klaw-sync";

import * as querystring from "querystring";
import * as rethink from "rethinkdb";
import tables from "tables.js";
import * as toml from "toml";
import * as util from "util";
import { bot as bot } from "./bot";

// multi-prompt
import MultiPrompt from "../classes/multiprompt";
// some Discord utils
const Embed = Discord.MessageEmbed;
type Embed = Discord.MessageEmbed;

const Message = Discord.Message;
type Message = Discord.Message;

const Role = Discord.Role;
type Role = Discord.Role;

const User = Discord.User;
type User = Discord.User;

const GuildChannel = Discord.GuildChannel;
type GuildChannel = Discord.GuildChannel;

const Guild = Discord.Guild;
type Guild = Discord.Guild;

const GuildMember = Discord.GuildMember;
type GuildMember = Discord.GuildMember;

const TextChannel = Discord.TextChannel;
type TextChannel = Discord.TextChannel;
// ---
import * as xreg from "xregexp";
const data = toml.parse(fs.readFileSync("./data.toml", "utf8"));
const a = 1;

const ownerID = "180813971853410305";

const colors = chalk;

// import commandHandler from "../commandHandler"

// export const commandHandle = export const commandHandler;
import * as Constants from "../constants/constants";

const decodeT = function(data: string): string {
  return Buffer.from(data, "base64").toString("ascii");
};

import CommandClient from "../classes/commandClient";
import Interval from "../classes/interval";
import messager from "../classes/messager";
import perms from "../classes/permissions";
import Searcher from "../classes/searcher";
import { Time } from "ztimespan";

import Command from "../classes/command";

export {
  db,
  cross,
  mathjs,
  Storage,
  _,
  burlp,
  https,
  http,
  logger,
  moment,
  transliteration,
  tr,
  slugify,
  bot,
  tables,
  assert,
  util,
  chalk,
  rethink,
  toml,
  fs,
  klaw,
  querystring,
  Discord,
  // multi-prompt
  MultiPrompt,
  // some Discord utils
  Embed,
  Message,
  Guild,
  Role,
  User,
  GuildChannel,
  GuildMember,
  TextChannel,
  // ---
  xreg,
  data,
  a,

  ownerID,

  colors,

  // commandHandler

  // commandHandle
  Constants,
  decodeT,

  CommandClient,
  messager,
  perms,
  Searcher,
  Time,
  Interval,

  Command,
};
