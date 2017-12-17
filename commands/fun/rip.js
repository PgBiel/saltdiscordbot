const { GuildMember, Message, TextChannel } = require("discord.js");
const Command = require("../../classes/command");
const { cmdFunc } = require("../../commandHandler");

const func = async (msg, { args, send, channel, member, author, guild }) => {
  let ripContent = "";
  if (!args) {
    ripContent = member ?
    member.displayName :
    author.username;
  } else if (channel instanceof TextChannel) {
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
  guildOnly: false,
});
