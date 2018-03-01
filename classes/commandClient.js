const { Client } = require("discord.js");
const Command = require("./command");

module.exports = class CommandClient extends Client {
  // prop - public commands: {[commandName: string]: Command};
  constructor(options = {}) {
    super(options);
    this.commands = {};
  }

  get funcs() {
    return require("../funcs/funcs"); // lazy require cuz me no want B U G S
  }
};
