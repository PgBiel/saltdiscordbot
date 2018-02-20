const bot = require("../../util/bot");
const ncrequire = require("../util/ncrequire");

/**
 * Loads commands.
 * @returns {void}
 */
module.exports = function loadCmds() {
  /* const loadedCmds = [];
  fs.readdirSync("./commands").map((f: string) => {
    if (/\.js$/.test(f)) {
      loadedCmds.push(ncrequire(`../commands/${f}`));
    }
  }); */
  const loadedCmds = ncrequire("../commands/cmdIndex").commands;
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
};
