const Command = require("../../classes/command");
const d = require("../../misc/d");
const { https, http } = d;

const func = async function (msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel
}) {
  const sendIt = (emb => {
    return send({ embed: emb, autoCatch: false, deletable: true }).catch(err => [403, 50013].includes(err.code) ?
      send("Please make sure I can send embeds in this channel.") :
      void(d.rejct(err, "[SEND-IT-INFO]")));
  });
  const action = (dummy && dummy.action ? dummy.action : String(arrArgs[0] || "")).toLowerCase();
  const arg = arrArgs.slice(dummy && dummy.action ? 0 : 1).join(" ");
  const noGActions = ["user", "member", "id", "userid", "stats", "bot"];
  const gActions = noGActions.concat([
    "server", "guild",
    "members",
    "emoji", "emojiid",
    "role", "roleid", "roles",
    "channel", "textchannel", "channels", "textchannels", "channelid", "textchannelid",
    "voicechannel", "voice", "voicechannels", "voiceid", "voicechannelid",
    "category", "categories", "categoryid",
    "perms", "dperms", "discordperms",
    "saltperms", "listperms" // I was going to alias it with "sperm" but then I realized...
  ]);
  const is = (...list) => list.includes(action);
  const usableActions = guild ? gActions : noGActions;
  if (!d._.trim(action)) {
    return reply("Please specify something to view information for! (See the help command if you need help.)");
  }
  if (!usableActions.includes(action)) {
    if (gActions.includes(action)) {
      return reply("You can only view that info when on a server!");
    }
    return reply("Unknown action (info to view)! (See the help command if you need help.)");
  }
  if (
    !is(
      "roleid", "id", "userid", "perms", "dperms", "discordperms", "channelid", "serverid", "guildid",
      "categoryid", "textchannelid", "voiceid", "voicechannelid", "emojiid"
    ) &&
    !channel.permissionsFor(guild.me).has(["EMBED_LINKS"])
  ) {
    return reply("I need the permission `Embed Links` on this channel to be able to send embeds! :frowning:");
  }
  const trArg = d._.trim(arg);
  const infoSubject = function(type, mentionRegex, ) {

  }
  channel.startTyping();
  if (is("user", "member", "id", "userid")) {
    if (!perms["info.user"]) return reply("Missing permission `info user`! :frowning:");
    let isLocal = false;
    let isCommon = true;
    let idHolder;
    if (!arg) {
      idHolder = author;
    } else if (["1", "<@1>", "clyde"].includes(arg.toLowerCase())) {
      idHolder = d.bot.users.get("1");
    } else { // TODO: Add SEARCH
      if (d.Constants.regex.NAME_AND_DISCRIM.test(trArg)) {
        idHolder = d.bot.users.find("tag", trArg);
      } else if (d.Constants.regex.ID.test(trArg) || d.Constants.regex.MENTION.test(trArg)) {
        try {
          const matched = trArg.match(d.Constants.regex.ID.test(trArg) ? d.Constants.regex.ID : d.Constants.regex.MENTION)[1];
          if (d.bot.users.has(matched)) {
            idHolder = d.bot.users.get(matched);
          } else {
            idHolder = await d.bot.users.fetch(matched);
          }
        } catch(err) {
          return reply("Unknown user!");
        }
      }
      if (!idHolder || !idHolder.id) {
        if (!guild) {
          return reply(`Please specify a validHolder.id username followed by a validHolder.id discriminator (e.g. \`User#1234\`), a validHolder.id \
user idHolder.id (e.g. \`80351110224678912\`) or a mention (e.g. <@${author.id}>).`);
        } else {
          const membersMatched = searcher.searchMember(trArg);
          let memberToUse;
          if (membersMatched) {
            if (membersMatched.length < 1) {
              return reply("Member not found!");
            } else if (membersMatched.length === 1) {
              memberToUse = membersMatched[0];
            } else if (membersMatched.length > 1 && membersMatched.length < 10) {
              const result = await promptAmbig(membersMatched);
              if (result.cancelled) {
                return;
              }
              memberToUse = result.subject;
            } else {
              return reply("Multiple members have matched your search. Please be more specific.");
            }
          }
          if (!memberToUse || !memberToUse.user) return reply("Member not found! :thinking:");
          idHolder = memberToUse.user;
        }
      }
    }
    if (!idHolder || !idHolder.id) return reply("It appears no user was found. :frowning:"); // :thonk:
    if (idHolder.id !== 1 && guild && guild.members.has(idHolder.id)) isLocal = true;
    const user = idHolder instanceof d.Discord.User ?
      idHolder :
      (
        idHolder.user ||
        idHolder
      );
    if (d.bot.guilds.filter(g => g.members.has(user.id)).size < 1) isCommon = false;
    if (is("id", "userid")) {
      return reply(`${user.tag}'s ID is \`${user.id}\`.`);
    } else {
      const member = guild && guild.members.has(user.id) ? guild.members.get(user.id) : null;
      const agent = member || user;
      const av = user.displayAvatarURL();
      const embed = new d.Embed()
        .setAuthor(`Info for user ${user.tag}`, av, av)
        .setThumbnail(av)
        .setDescription(
          `Joined Discord on ${d.momentUTC(user.createdAt)} (${d.ago(user.createdAt, Date.now(), true) || "some time"} ago)`
        )
        .setFooter(`Click the title for avatar URL | User ID: ${user.id}`);
      if (isCommon) {
        embed
          .addField("Status", d.capitalize(agent.presence.status), true)
          .addField("Activity", d.formatActivity(agent.presence.activity, true) || "None", true);
        if (member) {
          const rolesArr = member.roles
            .array()
            .filter(r => r.id !== guild.id)
            .sort((a, b) => b.position - a.position);
          const rolesJoined = rolesArr.length === guild.roles.size ? "All roles" : rolesArr.join(", ");
          const color = (member.displayHexColor ||
            d.Constants.strings.DEFAULT_ROLE_COLOR) === d.Constants.strings.DEFAULT_ROLE_COLOR ?
              d.Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR :
              member.displayHexColor;
          const isDefault = color === d.Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR;
          embed
            .addField("Nickname", member.displayName, true)
            .addField("Display Color (See sidebar)", color + (isDefault ? " (Default)" : ""), true)
            .addField(`Permissions (use ${p}perms)`, member.permissions.bitfield, true)
            .addField("Joined Server (UTC)", d.momentUTC(member.joinedAt, { addUTC: false }), true)
            .addField(
              `Roles${rolesArr.length ? ` (${rolesArr.length})` : ""}`,
              rolesJoined.length > d.Constants.numbers.MAX_FIELD_CHARS ?
                `Use \`${p}info roles <@!${user.id}>\` to see (too long)` :
                (
                  rolesJoined ||
                  "No roles"
                )
            )
            .setColor(color);
        }
      }
      return send({ embed, deletable: true });
    }
  } else if (is("role", "roleid")) {
    if (!perms["info.role"]) return reply("Missing permission `info role`! :frowning:");
    let role;
    if (!trArg) {
      role = guild.roles.get(guild.id);
    } else {
      if (d.Constants.regex.ID.test(trArg) || d.Constants.regex.ROLE_MENTION.test(trArg)) {
        try {
          const matched = trArg.match(
            d.Constants.regex.ID.test(trArg) ?
              d.Constants.regex.ID :
              d.Constants.regex.MENTION
          )[1];
          if (guild.roles.has(matched)) {
            role = guild.roles.get(matched);
          }
        } catch(err) {
          d.rejct(err, "[INFOROLE-MATCH]");
        }
      }
      if (!role) {
        const rolesMatched = searcher.searchRole(trArg);
        let roleToUse;
        if (rolesMatched) {
          if (rolesMatched.length < 1) {
            return reply("Role not found!");
          } else if (rolesMatched.length === 1) {
            roleToUse = rolesMatched[0];
          } else if (rolesMatched.length > 1 && rolesMatched.length < 10) {
            const result = await promptAmbig(rolesMatched, "roles", { type: "role" });
            if (result.cancelled) {
              return;
            }
            roleToUse = result.subject;
          } else {
            return reply("Multiple roles have matched your search. Please be more specific.");
          }
        }
        if (!roleToUse) return reply("Role not found! :thinking:");
        role = roleToUse;
      }
    }
    if (!role) return;
    if (is("roleid")) return reply(`The ID of the role **${d.escMarkdown(role.name)}** is \`${role.id}\`.`);
    const membersArr = role.members
      .array()
      .sort((a, b) => a.displayName > b.displayName);
    const membersJoined = membersArr.length === guild.members.size ? "All members" : membersArr.join(", ");
    const color = (role.hexColor ||
      d.Constants.strings.DEFAULT_ROLE_COLOR) === d.Constants.strings.DEFAULT_ROLE_COLOR ?
        d.Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR :
        role.hexColor;
    const isDefault = color === d.Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR;
    const colorURL = http.www.colourlovers.com(`/img/${color.replace(/^#/, "")}/100/100`).toString();
    const position = role.position < 1 ?
      "Bottom" :
      (
        role.position === guild.roles.size - 1 ?
          "Top" :
          role.position
      );
    const embed = new d.Embed()
      .setAuthor(`Info for Role "${role.name}"`, colorURL, colorURL)
      .setThumbnail(colorURL)
      .setColor(color)
      .setDescription(
        `Was created at ${d.momentUTC(role.createdAt)} (${d.ago(role.createdAt, Date.now(), true) || "some time"} ago)`
      )
      .addField(`Permissions (use ${p}perms)`, role.permissions.bitfield, true)
      .addField(`Is externally managed`, d.Constants.maps.YESNO[Boolean(role.managed)], true)
      .addField("Display Color (See sidebar)", color + (isDefault ? " (Default)" : ""), true)
      .addField(`Is displayed separately`, d.Constants.maps.YESNO[Boolean(role.hoist)], true)
      .addField("Position", position, true)
      .addField("Is mentionable", d.Constants.maps.YESNO[Boolean(role.mentionable)], true)
      .addField(
        `Members${membersArr.length ? ` (${membersArr.length})` : ""}`,
        membersJoined.length > d.Constants.numbers.MAX_FIELD_CHARS ?
          `Use \`\`${p}info members ${d.escMarkdown(role.name)}\`\` to see (too long)` :
          (
            membersJoined ||
            "No members"
          )
      )
      .setFooter(`Role ID: ${role.id}`);
    send({ embed, deletable: true });
  }
  return;
};
module.exports = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true, "info.perms": true,
    "info.saltperms": true
  },
  default: true,
  description: "Show information about commands/a command/a category of commands.",
  example: "{p}help\n{p}help 8ball\n{p}help Fun\n{p}help All",
  category: "Utility",
  args: {"command or category": true, "page (Default: 1)": true},
  aliases: {
    userinfo: {
      description: "Alias to info user. Specify an user to view its info",
      action: "user",
      perms: "info.user",
      args: { user: true },
      example: `
{p}userinfo
{p}userinfo Guy#0011
{p}userinfo 1
{p}userinfo @Sir#0145`,
      default: true
    },
    user: {
      description: "Alias to info user. Specify an user to view its info",
      action: "user",
      perms: "info.user",
      args: { user: true },
      example: `
{p}user
{p}user Guy#0011
{p}user 1
{p}user @Sir#0145`,
      default: true
    },
    id: {
      description: "Alias to info id. Specify an user to view its ID",
      action: "id",
      perms: "info.user",
      args: { user: true },
      example: `\
{p}id
{p}id Guy#0011
{p}id 1
{p}id @Sir#0145`,
      default: true
    },
    userid: {
      description: "Alias to info id. Specify an user to view its ID",
      action: "id",
      perms: "info.user",
      args: { user: true },
      example: `
{p}userid
{p}userid Guy#0011
{p}userid 1
{p}userid @Sir#0145`,
      default: true
    },
    roleinfo: {
      description: "Alias to info role (See `role` for managing roles). Specify a role to view its info",
      action: "role",
      perms: "info.role",
      args: { role: true },
      example: `
{p}roleinfo
{p}roleinfo Cool People
{p}roleinfo everyone
{p}roleinfo 123456789`,
      default: true
    },
    roleid: {
      description: "Alias to info roleid. Specify a role to view its ID",
      action: "roleid",
      perms: "info.role",
      args: { role: true },
      example: `
{p}roleid
{p}roleid Cool People
{p}roleid everyone
{p}roleid 123456789`,
      default: true
    }
  },
  guildOnly: false
});