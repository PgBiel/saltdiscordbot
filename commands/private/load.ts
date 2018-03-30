const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, { args, doEval, send, reply, self }) {
  if ((msg.author.id !== d.Constants.identifiers.APLET && msg.author.id !== d.ownerID) || !args) {
    return;
  }
  const cmd = d.loadCmd(args);
  reply(`\`\`\`js\n${d.util.inspect(cmd)}\n\`\`\``, { deletable: true });
};
module.exports = new Command({
  func,
  name: "load",
  description: "Reload a command.",
  example: "+load info",
  category: "Private",
  guildOnly: false,
  customPrefix: "+",
  args: { command: false },
  devonly: true
});
