const { Client, ClientOptions } = require("discord.js");
const Command = require("./command");

module.exports = class CommandClient extends Client {
  // prop - public commands: {[commandName: string]: Command};
  constructor(options = {}) {
    super(options);
    this.commands = {};
  }
};
