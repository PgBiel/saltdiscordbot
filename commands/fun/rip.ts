const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, { args, send, reply, channel, member, author, guild, perms }) {
  if (guild && !perms.rip) return reply("Missing permission `rip`! :frowning:");
  let ripContent = "";
  if (!args) {
    ripContent = member ?
    member.displayName :
    author.username;
  } else if (channel instanceof d.TextChannel) {
    ripContent = args.replace(/<@!?\d+>/g, mention => {
      const id = mention.match(/^<@!?(\d+)>$/)[1];
      const memberToUse = guild.members.get(id);
      if (!memberToUse) {
        return mention;
      }
      return memberToUse.displayName;
    });
  } else {
    ripContent = args;
  }
  return send(`http://ripme.xyz/#${encodeURIComponent(ripContent)}`);
};
module.exports = new Command({
  func,
  name: "rip",
  perms: "rip",
  default: true,
  description: "RIP. Generates a ripme.xyz link.",
  example: "{p}rip John",
  category: "Fun",
  args: {text: true},
  guildOnly: false
});
