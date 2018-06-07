import { cmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "../info/info";
import {
  User, GuildMember, bot, search, cross, rejct, Embed, ago, momentUTC, formatStatus,
  formatActivity, Constants, Command
} from "../../misc/d";

const func: cmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.user"]) return reply("Missing permission `info user`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  const arg = trArg || _arg || args;
  let isLocal = false;
  let isCommon = true;
  let idHolder: User | GuildMember;
  if (!arg) {
    idHolder = author;
  } else if (["1", "<@1>", "clyde"].includes(arg.toLowerCase())) {
    idHolder = bot.users.get("1");
  } else {
    const searched = await (search(arg, "user", { guild, send, reply, promptAmbig }, { allowForeign: true }));
    if (searched.subject) {
      idHolder = searched.subject;
    } else {
      return;
    }
  }
  if (!idHolder || !idHolder.id) return; // :thonk:
  if (idHolder.id !== "1" && guild && guild.members.has(idHolder.id)) isLocal = true;
  const user: User = idHolder instanceof User ?
    idHolder :
    (
      (idHolder as GuildMember).user ||
      idHolder as never
    );
  if (["id", "userid"].includes(action)) {
    return reply(`${user.tag}'s ID is \`${user.id}\`.`);
  } else {
    channel.startTyping();
    const userId: string = user.id;
    if (bot.guilds.filter(g => g.members.has(userId)).size < 1) isCommon = false;
    if (!isCommon) {
      try {
        const filtered = await (cross.guilds.filter(g => g.members.has(userId), { userId }));
        isCommon = Boolean(await filtered.size());
      } catch (err) {
        rejct(err, "[ISCOMMON-USER]");
      }
    }
    const member: GuildMember = guild && guild.members.has(user.id) ? guild.members.get(user.id) : null;
    const agent: GuildMember | User = member || user;
    const av: string = user.displayAvatarURL();
    const embed: Embed = new Embed()
      .setAuthor(`Info for user ${user.tag}${user.bot ? " [BOT]" : ""}`, av, av)
      .setThumbnail(av)
      .setDescription(
        `Joined Discord ${ago(user.createdAt, Date.now(), true) || "some time"} ago (${momentUTC(user.createdAt)})`
      )
      .setFooter(`Click the title for avatar URL | User ID: ${user.id}`);
    if (isCommon) {
      embed
        .addField("Status", formatStatus(agent.presence.status), true)
        .addField("Activity", formatActivity(agent.presence.activity, true) || "None", true);
      if (member) {
        const rolesArr = member.roles
          .array()
          .filter(r => r.id !== guild.id)
          .sort((a, b) => b.position - a.position);
        const rolesJoined = rolesArr.length === guild.roles.size ?
          "All roles" :
          rolesArr.map(r => android ? (r || {} as never).name : String(r)).join(", ");
        const color = (member.displayHexColor ||
          Constants.strings.DEFAULT_ROLE_COLOR) === Constants.strings.DEFAULT_ROLE_COLOR ?
            Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR :
            member.displayHexColor;
        const isDefault = color === Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR;
        embed
          .addField("Nickname", member.displayName, true)
          .addField("Display Color (See sidebar)", color + (isDefault ? " (Default)" : ""), true)
          .addField(`Permissions (use ${p}perms)`, member.permissions.bitfield, true)
          .addField("Joined Server (UTC)", momentUTC(member.joinedAt, { addUTC: false }), true)
          .addField(
            `Roles${rolesArr.length ? ` (${rolesArr.length})` : ""}`,
            rolesJoined.length > Constants.numbers.max.chars.FIELD ?
              `Use \`${p}info roles <@!${user.id}>\` to see (too long)` :
              (
                rolesJoined ||
                "No roles"
              )
          )
          .setColor(color);
      }
    }
    return sendIt(embed);
  }
};

export const userinfo = new Command({
  description: "Alias to info user. Specify an user to view its info",
  func,
  name: "userinfo",
  category: "Info",
  guildOnly: false,
  perms: "info.user",
  args: { user: true },
  example: `
{p}{name}
{p}{name} Guy#0011
{p}{name} 1
{p}{name} @Sir#0145`,
  default: true,
  aliases: {
    user: {
      description: "Alias to info user. Specify an user to view its info",
      action: "user"
    },
    id: {
      description: "Alias to info id. Specify an user to view its ID",
      action: "id"
    },
    userid: {
      description: "Alias to info id. Specify an user to view its ID",
      action: "id"
    }
  }
});
