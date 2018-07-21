import { TcmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  Role, GuildMember, bot, search, Embed, ago, momentUTC, Constants, escMarkdown, http, no2Tick, Command
} from "../../misc/d";

const func: TcmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.role"]) return reply("Missing permission `info role`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  const arg = trArg || _arg || args;
  let role: Role;
  if (!arg) {
    role = guild.roles.get(guild.id);
  } else {
    const { subject } = await (search(arg, "role", { guild, send, reply, promptAmbig }));
    if (subject) {
      role = subject;
    } else {
      return;
    }
  }
  if (!role) return;
  if (action === "roleid") return reply(`The ID of the role **${escMarkdown(role.name)}** is \`${role.id}\`.`);
  channel.startTyping();
  const membersArr: GuildMember[] = role.members
    .array()
    .sort((a, b) => Number(a.displayName > b.displayName));
  const membersJoined: string = membersArr.length === guild.members.size ?
    "All members" :
    membersArr.map(m => android ? ((m || {} as never).user || {} as never).tag : String(m)).join(", ");
  const color: string = (role.hexColor ||
    Constants.strings.DEFAULT_ROLE_COLOR) === Constants.strings.DEFAULT_ROLE_COLOR ?
      Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR :
      role.hexColor;
  const isDefault: boolean = color === Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR;
  const colorURL: string = http.www.colourlovers.com(`/img/${color.replace(/^#/, "")}/100/100`).toString();
  const permsz: string = role.permissions.has(["ADMINISTRATOR"]) ?
    "All (Administrator)" :
      role.permissions.bitfield === 2146958583 ?
        "All but administrator" :
        String(role.permissions.bitfield);
  const position: number | string = role.position < 1 ?
    "Bottom" :
    (
      role.position === guild.roles.size - 1 ?
        "Top" :
        role.position
    );
  const embed: Embed = new Embed()
    .setAuthor(`Info for Role "${role.name}"`, colorURL, colorURL)
    .setThumbnail(colorURL)
    .setColor(color)
    .setDescription(
      `Was created ${ago(role.createdAt, Date.now(), true) || "some time"} ago (${momentUTC(role.createdAt)})`
    )
    .addField(`Permissions (use ${p}perms)`, permsz, true)
    .addField(`Is externally managed`, Constants.maps.YESNO[String(Boolean(role.managed))], true)
    .addField("Display Color (See sidebar)", color + (isDefault ? " (Default)" : ""), true)
    .addField(`Is displayed separately`, Constants.maps.YESNO[String(Boolean(role.hoist))], true)
    .addField("Position", position, true)
    .addField("Is mentionable", Constants.maps.YESNO[String(Boolean(role.mentionable))], true)
    .addField(
      `Members${membersArr.length ? ` (${membersArr.length})` : ""}`,
      membersJoined.length > Constants.numbers.max.chars.FIELD ?
        `Use \`\`${p}info members ${no2Tick(role.name)}\`\` to see (too long)` :
        (
          membersJoined ||
          "No members"
        )
    )
    .setFooter(`Role ID: ${role.id} | Server ID: ${guild.id}`);
  return sendIt(embed);
};

export const roleinfo = new Command({
  description: "Alias to info user. Specify an user to view its info",
  func,
  name: "roleinfo",
  perms: "info.role",
  args: { role: true },
  category: "Information",
  guildOnly: true,
  example: `
{p}{name}
{p}{name} Guy#0011
{p}{name} 1
{p}{name} @Sir#0145`,
  default: true,
  aliases: {
    roleid: {
      description: "Alias to info roleid. Specify a role to view its ID",
      action: "roleid"
    }
  }
});
