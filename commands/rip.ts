import { GuildMember, Message, TextChannel } from "discord.js";
import Command from "../classes/command";
import { cmdFunc } from "../commandHandler";

const func: cmdFunc = async (msg: Message, { args, send, channel, member, author, guild }) => {
  let ripContent: string = "";
  if (!args) {
    ripContent = member ?
    member.displayName :
    author.username;
  } else if (channel instanceof TextChannel) {
    ripContent = args.replace(/<@!?\d+>/g, (mention: string) => {
      const id: string = mention.match(/^<@!?(\d+)>$/)[1];
      const memberToUse: GuildMember = guild.members.get(id);
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
export const rip = new Command({
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
