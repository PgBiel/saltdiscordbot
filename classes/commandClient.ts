import * as Discord from "discord.js";
import Command from "./command";
import funcs = require("../funcs/funcs");

class CommandClient extends Discord.Client {
  public commands: { [name: string]: Command };
  public bot?: this;

  // prop - public commands: {[commandName: string]: Command};
  constructor(options = {}) {
    super(options);
    this.commands = {};
  }

  get funcs() {
    const funcso: typeof funcs = require("../funcs/funcs");
    return funcso;
  }
}

export default CommandClient;
