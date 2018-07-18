import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import { Role, GuildMember, bot, search, Embed, ago, momentUTC, Constants, adaptSnake, Command } from "../../misc/d";

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.server"]) return reply("Missing permission `info server`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  if (["serverid", "guildid"].includes(action)) return reply(`The ID of the current server is \`${guildId}\`.`);
  channel.startTyping();
  const icon = guild.iconURL();
  const emb = new Embed()
    .setAuthor(
      guild.name,
      icon,
      icon
    )
    .setDescription(
      `Was created ${ago(guild.createdAt, Date.now(), true) || "some time"} ago (${momentUTC(guild.createdAt)})`
    )
    .setThumbnail(icon || Constants.images.SERVER_INFO.NO_ICON)
    .setFooter(`${icon ? "Click the title for Icon URL | " : ""}Server ID: ${guild.id}`)
    .addField("Owner", `<@!${guild.ownerID}>`, true)
    .addField(
      "Oldest Channel",
      guild.channels.filter(c => c.type === "text").sort((a, b) => a.createdTimestamp - b.createdTimestamp).first(),
      true
    )
    .addField(
      "Member Amount",
      `${guild.members.filter(m => m.presence.status !== "offline").size} online, ${guild.members.size} total`,
      true
    )
    .addField("Channel Amount", guild.channels.size, true)
    .addField("Role Amount", guild.roles.size, true)
    .addField("Emoji Amount", guild.emojis.size, true)
    .addField("Region", adaptSnake(guild.region), true)
    .addField("Verification Level", Constants.maps.VERIF[guild.verificationLevel], true);
  if (guild.features.length) emb.addField("Features", adaptSnake(guild.features) || "None");
  return sendIt(emb);
};

/* export const serverinfo = new Command({
  description: "View info of current server",
  func,
  name: "serverinfo",
  perms: "info.server",
  args: {},
  guildOnly: true,
  category: "Info",
  example: `
{p}{name}`,
  default: true,
  aliases: {
    guildinfo: {
      description: "View info of current server",
      action: "serverinfo"
    },
    serverid: {
      description: "View ID of current server",
      action: "serverid"
    },
    guildid: {
      description: "View ID of current server",
      action: "serverid"
    }
  }
}); */
