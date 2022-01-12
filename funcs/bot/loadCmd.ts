import bot from "../../util/bot";
import cmdIndex = require("../../commands/cmdIndex");
import ncrequire from "../util/ncrequire";
import Command from "../../classes/command";

/**
 * Load one command.
 * @param {string} cmdn Name of the command
 * @returns {?Command}
 */
export default function loadCmd(cmdn: string) {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const loadedCmds: { [cmdname: string]: Command } = ncrequire("../../commands/cmdIndex").commands;
  if (loadedCmds.hasOwnProperty(cmdn) ) {
    const cmd = loadedCmds[cmdn];
    // const parsed = commandParse(loadedCmds[cmd]);
    // if (parsed) {
    bot.commands[cmd.name] = cmd;
    if (cmd.aliases) {
      for (const cmd2 of Object.values(cmd.aliases)) {
        if (!cmd2.name) continue;
        bot.commands[cmd2.name] = cmd2;
        if (cmd2.aliases) {
          for (const cmd3 of Object.values(cmd2.aliases as { [name: string]: Command })) {
            if (!cmd3.name) continue;
            bot.commands[cmd3.name] = cmd3;
          }
        }
      }
    }
    return cmd;
    // }
  }
}