import { Client } from "discord.js";
import Command from "./command";

export default class CommandClient extends Client {
  public commands: {[commandName: string]: Command};
  constructor(options: {[option: string]: any} = {}) {
    super(options);
    this.commands = {};
  }
}
