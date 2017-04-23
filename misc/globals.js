const chalk = require("chalk");
const Constants = require("./constants");
const fs = require("fs");
const toml = require("toml");
const Discord = require("discord.js");
const commandParse = require("../commandParse");
const commandHandler = require("../commandHandler");
const logger = require("../classes/logger");
const util = require("util");
const _ = require("lodash");
const Command = require("../classes/command");
const assert = require("assert");
const perms = require("../classes/permissions");
const decodeT = require("./decodeT");
const r = require("rethinkdb");

const obj = {
  ownerID: "180813971853410305",
  Constants,
  fs,
  toml,
  Discord,
  colors: chalk,
  Sequelize,
  commandParse,
  commandHandler,
  util,
  _,
  Command,
  assert,
  perms,
  logger,
};
Object.assign(obj, {
  bot: new obj.Discord.Client({
    disableEveryone: true,
    disabledEvents: ["TYPING_START", "TYPING_STOP"],
    fetchAllMembers: true
  }),
  sql: new obj.Sequelize("botdata", null, null, {
    host: "localhost",
    dialect: "sqlite",
    storage: "botdata.sqlite",
    logging() {
      const arrayThing = Array.from(arguments);
      arrayThing.unshift(obj.colors.yellow("[SQL]"));
      SQLLogger.apply({}, arrayThing);
    }
  }),
  commandParser: obj.commandParse,
  commandHandle: obj.commandHandler,
  chalk: obj.colors,
  rejct: function(rejection){
    logger.custom(rejection, "[ERR/REJECT]", "red", "error");
  },
});
const funcs = {
  messagerDoEval: data => {
    let { message, gueldid, input, chanel } = data.vars;
    try {
      messager.emit(`${data.id}eval`, {
        success: true,
        result: eval(data.content)
      });
    } catch (err) {
      messager.emit(`${data.id}eval`, {
        success: false,
        result: err
      });
    }
  },
  djsDebug: info => {
    logger.custom(info, `[${/^(?:Sending heartbeat|Heartbeat acknowledged)$/i.test(info)?"HEARTBEAT":"DJS DEBUG"}]`, "magenta");
  },
  djsWarn: info => {
    logger.custom(info, `[DJS WARN]`, "yellow");
  },
  botMessage: (msg) => {
    const thingy = commandHandler(msg);
    if (thingy.catch) thingy.catch(rejct);
  },
  processMessage: data => {
    logger.debug("Received message");
  },
  ncrequire: fpath => {
    delete require.cache[require.resolve(fpath)];
    return require(fpath);
  },
  cloneObject: objec=>{
    return Object.assign(Object.create(objec), objec);
  },
  loadCmds: _ => {
    const loadedCmds = [];
    fs.readdirSync("./commands").map(f => {
      if (/\.js$/.test(f)) loadedCmds.push(ncrequire(`../commands/${f}`));
    });
    for (let cmd in loadedCmds) {
      const parsed = commandParse(loadedCmds[cmd]);
      if (parsed) bot.commands[parsed.name] = parsed;
    }
  },
  isUnique: err => err == null ? false : err.name === Constants.sql.UNIQUE_CONSTRAINT,
  SQLLogger: function(...stuff) {
    return logger.custom(stuff, "[SQL]", "yellow");
  },
  doError: function(...stuff) {
    return logger.error(stuff);
  },
  bcEval: function() {
    return bot.shard.broadcastEval.apply(bot.shard, Array.from(arguments));
  },
  decodeT
};
obj.funcs = funcs;
Object.assign(global, obj);