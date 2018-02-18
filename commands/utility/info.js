/* const Command = require("../../classes/command");
const d = require("../../misc/d");

const map = { Mod: "Moderation", Admin: "Administration", Util: "Utility" };

const func = async function (msg, { args, arrArgs, send, reply, prefix, botmember, dummy, guild, perms }) {
  if (guild && !perms.help) return reply("Missing permission `help`! (Try using this command by messaging me instead.)");
  const sendIt = (emb => {
    return send({ embed: emb, autoCatch: false, deletable: true }).catch(err => [403, 50013].includes(err.code) ?
      send("Please make sure I can send embeds in this channel.") :
      void(d.rejct(err)));
  });
  const action = dummy && dummy.action ? dummy.action : arrArgs[0];
  
};
module.exports = new Command({
  func,
  name: "help",
  perms: "help",
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help Fun\n{p}help All",
  category: "Utility",
  args: {"command or category": true, "page (Default: 1)": true},
  guildOnly: false
});*/