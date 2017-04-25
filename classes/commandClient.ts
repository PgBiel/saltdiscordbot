import { Client, ClientOptions } from "discord.js";
import Command from "./command";

export default class CommandClient extends Client {
  public commands: {[commandName: string]: Command};
  constructor(options: ClientOptions = {}) {
    super(options);
    this.commands = {};
  }
}
