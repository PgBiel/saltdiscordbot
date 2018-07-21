// tslint:disable:no-bitwise

import { cmdFunc } from "../../misc/contextType";
import { AInfoDummy } from "./info";
import {
  search, Embed, Constants, Command, GuildChannel, escMarkdown, GuildMember, Role, adaptSnake
} from "../../misc/d";
import { Permissions, User, PermissionResolvable } from "discord.js";

const func: cmdFunc<AInfoDummy> = async function(msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member, sendIt
}) {
  if (!perms["info.perms"]) return reply("Missing permission `info perms`! :frowning:");
  const { android, action, arg: _arg, trArg } = dummy || {} as never;
  const arg = String(trArg || _arg || args).toLowerCase();

  /**
   * Special permission humanizations (otherwise just convert "_"  to spaces)
   */
  const special = {
    MANAGE_GUILD: "Manage Server",
    USE_VAD: "Use Voice Activity",
    VIEW_CHANNEL: "View Channel (Read Messages/Connect to Voice)"
  };
  let use: Permissions;

  type PermType = "user" | "role" | "number";
  let type: PermType = "role";
  // let chan: GuildChannel; - TODO: Make ChannelPerms
  let specified: string;
  if (action === "cperms") {
    // wip
  } else {
    if (!guild && !/^(?:number )?\d+$/.test(arg)) {
      return reply("Please specify a number to view permissions in it! (That's the only action you can use outside of \
a server.)");
    }
    if (!arg) {
      type = "user";
      specified = author.tag;
      use = member.permissions;
    } else if (/^\d+$/.test(arg) && arg.length < 16) {
      type = "number";
      specified = arg;
      use = new Permissions(Number(arg));
    } else if (Constants.regex.MENTION.test(arg) || Constants.regex.NAME_AND_DISCRIM.test(arg)) {
      if (!guild) return reply("You must be in a server to use this!");
      type = "user";
      const { subject } = await (search(arg, "user", self, { allowForeign: false }));
      if (subject) {
        const zeMember = guild.member(subject);
        specified = zeMember.user.tag;
        use = zeMember.permissions;
      } else {
        return;
      }
    } else if (/^(?:user|member|role|number)(?:$|\s)/.test(arg)) {
      const [preType, ...preName]: string[] = arg.split(/\s+/);
      // preType: type of argument; preName: search term
      type = preType === "member" ? "user" : preType as PermType;
      const name: string = preName.join(" ");
      if (!name) { // no search term found, so let's try some things
        if (type === "user") { // if type is user, then default to author
          specified = author.tag;
          use = member.permissions;
        } else if (type === "role") { // if type is role, then default to author's highest role
          const rol = member.roles.highest;
          specified = rol.name;
          use = rol.permissions;
        } else if (type === "number") { // if type is number, require them to specify one.
          return reply("Please specify a permissions number!");
        }
      } else {
        if (type === "user" || type === "role") {
          const { subject } = await (search(name, type, self, { allowForeign: false }));
          if (subject && subject instanceof User || subject instanceof GuildMember || subject instanceof Role) {
            specified = subject instanceof User || subject instanceof GuildMember ?
              (subject instanceof User ? subject : subject.user).tag :
              subject.name;
            use = (subject instanceof User ? guild.member(subject) : subject).permissions;
          } else {
            return;
          }
        } else if (type === "number") {
          if (name.length > 15) return reply("Please specify a valid permissions number!");
          specified = name;
          use = new Permissions(Number(name));
        }
      }
    } else if (guild) { // default to role
      const { subject } = await (search(arg, "role", self, { allowForeign: false }));
      if (subject) {
        specified = subject.name;
        use = subject.permissions;
      } else {
        return;
      }
    } else {
      return reply("Please specify a number to view permissions in it! (That's the only action you can use outside of \
a server.)");
    }
  }
  if (!(use instanceof Permissions)) return;
  // tslint:disable-next-line:prefer-const
  let chanText: string = ""; // TODO: Work with ChannelPerms
  /* if (chan) {
    switch (chan.type) {
      case "text":
      case "voice":
        chanText = ` in the ${chan.type} channel **${chan.type === "text" ? String(chan) : chan.name}**`;
        break;

      case "category":
        chanText = ` in the category **${chan.name}**`;
        break;
    }
  } */
  let str: string = `Permissions \
${type === "number" ? `stored in the number` : `for ${type === "user" ? "member" : "role"}`} **${specified}**${chanText}:
\`\`\`diff\n`;
  if (use.has("ADMINISTRATOR")) {
    str += `+ All (Includes Administrator)`;
  } else if (use.bitfield === (Permissions.ALL | Permissions.FLAGS.ADMINISTRATOR)) { // all except admin
    str += `+ All (Doesn't Include Administrator)`;
  } else if (use.bitfield < 1) {
    str += `- None`;
  } else {
    for (const flag of Object.keys(Permissions.FLAGS)) {
      str += `${use.has(flag as PermissionResolvable) ? "+" : "-"} ${special[flag] || adaptSnake(flag)}\n`;
    }
  }
  return send(str + "```", { deletable: true });
};

export const perms = new Command({
  description: "View an user's, a role's or a number's perms.",
  func,
  name: "perms",
  perms: "info.perms",
  args: {
    "a number (to check a number), a role (to check a role) or an action (user/role/number)": true,
    "user, number or role to check (if using action)": true
  },
  guildOnly: false, // outside of guilds, only number is permitted
  category: "Information",
  example: `
{p}{name}
{p}{name} 16
{p}{name} My Cool Role
{p}{name} role My Cool Role
{p}{name} user UserSirMan
{p}{name} @UserSirMan#1234`,
  default: true,
  aliases: {
    dperms: { /* lol */ },
    discordperms: { /* lol */ },
    cperms: {
      description: "View permissions in a channel (text or voice) or category for a user, a role or a number. You \
simply run this command, and it will ask you what you want to see in three short steps.",
      args: {},
      guildOnly: true,
      action: "cperms",
      example: `
{p}{name}`,
      show: true,
      aliases: { channelperms: {} } // empty obj alias means full copy of command
    }
  }
});
