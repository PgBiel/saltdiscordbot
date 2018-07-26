import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import { Role, GuildMember, bot, search, Embed, ago, momentUTC, Constants, adaptSnake, Command } from "../../misc/d";
import { Collection } from "discord.js";

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.membercount"]) return reply("Missing permission `info membercount`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  const onlyOnline = (coll: Collection<string, GuildMember>) => coll.filter(m => m.user.presence.status !== "offline");
  const { members } = guild;
  const humans: Collection<string, GuildMember> = new Collection<string, GuildMember>();
  const bots: Collection<string, GuildMember> = new Collection<string, GuildMember>();

  const { ONLINE } = Constants.emoji.rjt;
  members.forEach(m => (m.user.bot ? bots : humans).set(m.id, m));
  return send(
    `In this server, there is a total of **${members.size}** members (${onlyOnline(members).size}${ONLINE}), with:
- **${humans.size}** humans (${onlyOnline(humans).size}${ONLINE});
- **${bots.size}** bots (${onlyOnline(bots).size}${ONLINE}).`
);
};

export const membercount = new Command({
  description: "View amount of members in the server",
  func,
  name: "membercount",
  perms: "info.membercount",
  args: {},
  guildOnly: true,
  category: "Information",
  example: `
{p}{name}`,
  default: true,
  aliases: {
    count: {}
  }
});
