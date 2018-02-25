const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig
}) {
  const sendIt = (emb => {
    return send({ embed: emb, autoCatch: false, deletable: true }).catch(err => [403, 50013].includes(err.code) ?
      send("Please make sure I can send embeds in this channel.") :
      void(d.rejct(err)));
  });
  const action = (dummy && dummy.action ? dummy.action : String(arrArgs[0] || "")).toLowerCase();
  const arg = arrArgs.slice(dummy && dummy.action ? 0 : 1).join(" ");
  const noGActions = ["user", "member", "id", "userid", "stats", "bot"];
  const gActions = noGActions.concat([
    "server", "guild",
    "role", "roles",
    "channel", "textchannel", "channels",
    "voicechannel", "voice", "voicechannels",
    "category", "categories",
    "perms", "dperms", "discordperms",
    "saltperms" // I was going to alias it with "sperm" but then I realized...
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
  const trArg = d._.trim(arg);
  if (is("user", "member", "id", "userid")) {
    if (!perms["info.user"]) return reply("Missing permission `info user`! :frowning:");
    let isLocal = true;
    let idHolder;
    if (!arg) {
      idHolder = author;
    } else if (["1", "<@1>", "clyde"].includes(arg.toLowerCase())) {
      idHolder = d.bot.users.get("1");
    } else {
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
    if (is("id", "userid")) {
      return reply(`${user.tag}'s ID is \`${user.id}\`.`);
    } else {
      const member = guild && guild.members.has(user.id) ? guild.members.get(user.id) : null;
      const agent = member || user;
      const av = user.displayAvatarURL();
      const embed = new d.Embed()
        .setAuthor(`Info for user ${user.tag}`, av, av)
        .setThumbnail(av)
        .setDescription(`Joined Discord on ${d.momentUTC(user.createdAt)} (${d.ago(user.createdAt, Date.now())} ago)`)
        .addField("Status", d.capitalize(agent.presence.status), true)
        .addField("Activity", d.formatActivity(agent.presence.activity, true) || "None", true)
        .setFooter(`Click the title for avatar URL | ID: ${user.id}`);
      if (member) {
        const rolesJoined = member.roles.array().sort((a, b) => b.position - a.position).join(", ");
        const color = (member.displayHexColor ||
          d.Constants.strings.DEFAULT_ROLE_COLOR) === d.Constants.strings.DEFAULT_ROLE_COLOR ?
            d.Constants.strings.DISPLAY_DEFAULT_ROLE_COLOR :
            member.displayHexColor;
        embed.addField("Nickname", member.displayName, true)
          .addField("Display Color (See sidebar)", color, true)
          .addField(`Permissions (use ${p}perms)`, member.permissions.bitfield, true)
          .addField("Joined Server (UTC)", d.momentUTC(member.joinedAt, { addUTC: false }), true)
          .addField(
            `Roles (${member.roles.size})`,
            rolesJoined.length > d.Constants.numbers.MAX_FIELD_CHARS ?
              `Use \`${p}info roles <@!${user.id}>\` to see (too long)` :
              rolesJoined
          )
          .setColor(color);
      }
      return send({ embed, deletable: true });
    }
  }
};
module.exports = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true
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
      example: `
{p}userinfo Guy#0011
{p}userinfo 1
{p}userinfo @Sir#0145`,
      default: true
    },
    user: {
      description: "Alias to info user. Specify an user to view its info",
      action: "user",
      perms: "info.user",
      example: `
{p}user Guy#0011
{p}user 1
{p}user @Sir#0145`,
      default: true
    }
  },
  guildOnly: false
});