import bot from "../../util/bot";
import cmdIndex = require("../../commands/cmdIndex");
import ncrequire from "../util/ncrequire";
import Command from "../../classes/command";

/**
 * Loads commands.
 * @returns {void}
 */
export default function loadCmds() {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const cmdIndex: any = ncrequire("../../commands/cmdIndex");
  const loadedCmds: { [cmdname: string]: Command } = cmdIndex.commands;
  for (const cmdn in loadedCmds) {
    if (loadedCmds.hasOwnProperty(cmdn)) {
      const cmd = loadedCmds[cmdn];
      // const parsed = commandParse(loadedCmds[cmd]);
      // if (parsed) {
      bot.commands[cmd.name] = cmd;
      if (cmd.aliases) {
        for (const cmd2 of Object.values(cmd.aliases)) {
          if (!cmd2.name) continue;
          bot.commands[cmd2.name] = cmd2;
        }
      }
      // }
    }
  }
}
