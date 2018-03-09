const Command = require("../../classes/command");
const d = require("../../misc/d");
const { https, http } = d;

const func = async function (msg, {
  args, author, arrArgs, send, reply, prefix: p, botmember, dummy, guild, guildId, perms, searcher, promptAmbig,
  channel, self, member
}) {
  const sendIt = (emb, opts) => {
    return send(Object.assign({ embed: emb, autoCatch: false, deletable: true }, opts))
      .catch(err => [403, 50013].includes(err.code) ?
        send("Please make sure I can send embeds in this channel.") :
        void(d.rejct(err, "[SEND-IT-INFO]"))
      );
  };
  const action = (dummy && dummy.action ? dummy.action : String(arrArgs[0] || "")).toLowerCase();
  const arg = arrArgs.slice(dummy && dummy.action ? 0 : 1).join(" ");
  const noGActions = [
    "user", "member", "id", "userid",
    "channel", "textchannel", "text", "channels", "textchannels", "texts", "channelid", "textid", "textchannelid",
    "voicechannel", "voice", "voices", "voicechannels", "voiceid", "voicechannelid", 
    "category", "categories", "categoryid", "ctg", "ctgs", "ctgid",
    "stats", "bot"];
  const gActions = noGActions.concat([
    "server", "guild", "serverid", "guildid",
    "members",
    "emoji", "emojiid",
    "role", "roleid", "roles",
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
    guild &&
    !is(
      "roleid", "id", "userid", "perms", "dperms", "discordperms", "channelid", "serverid", "guildid",
      "categoryid", "textchannelid", "voiceid", "voicechannelid", "emojiid"
    ) &&
    !channel.permissionsFor(guild.me).has(["EMBED_LINKS"])
  ) {
    return reply("I need the permission `Embed Links` on this channel to be able to send embeds! :frowning:");
  }
  const trArg = d._.trim(arg);
  if (is("user", "member", "id", "userid")) {
    if (!perms["info.user"]) return reply("Missing permission `info user`! :frowning:");
    let isLocal = false;
    let isCommon = true;
    let idHolder;
    if (!arg) {
      idHolder = author;
    } else if (["1", "<@1>", "clyde"].includes(arg.toLowerCase())) {
      idHolder = d.bot.users.get("1");
    } else {
      const searched = await (d.search(trArg, "user", self, { allowForeign: true }));
      if (searched.subject) {
        idHolder = searched.subject;
      } else {
        return;
      }
    }
    if (!idHolder || !idHolder.id) return; // :thonk:
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
      channel.startTyping();
      const userId = user.id;
      if (d.bot.guilds.filter(g => g.members.has(userId)).size < 1) isCommon = false;
      if (!isCommon) {
        try {
          const filtered = await (d.cross.guilds.filter(g => g.members.has(userId), { userId }));
          isCommon = Boolean(await (filtered.size()));
        } catch (err) {
          d.rejct(err, "[ISCOMMON-USER]");
        }
      }
      const member = guild && guild.members.has(user.id) ? guild.members.get(user.id) : null;
      const agent = member || user;
      const av = user.displayAvatarURL();
      const embed = new d.Embed()
        .setAuthor(`Info for user ${user.tag}${user.bot ? " [BOT]" : ""}`, av, av)
        .setThumbnail(av)
        .setDescription(
          `Joined Discord ${d.ago(user.createdAt, Date.now(), true) || "some time"} ago (${d.momentUTC(user.createdAt)})`
        )
        .setFooter(`Click the title for avatar URL | User ID: ${user.id}`);
      if (isCommon) {
        embed
          .addField("Status", d.formatStatus(agent.presence.status), true)
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
              rolesJoined.length > d.Constants.numbers.max.chars.FIELD ?
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
  } else if (is("role", "roleid")) {
    if (!perms["info.role"]) return reply("Missing permission `info role`! :frowning:");
    let role;
    if (!trArg) {
      role = guild.roles.get(guild.id);
    } else {
      const { subject } = await (d.search(trArg, "role", self));
      if (subject) {
        role = subject;
      } else {
        return;
      }
    }
    if (!role) return;
    if (is("roleid")) return reply(`The ID of the role **${d.escMarkdown(role.name)}** is \`${role.id}\`.`);
    channel.startTyping();
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
    const permsz = role.permissions.has(["ADMINISTRATOR"]) ?
      "All (Administrator)" :
        role.permissions.bitfield === 2146958583 ?
          "All but Administrator" :
          role.permissions.bitfield;
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
        `Was created ${d.ago(role.createdAt, Date.now(), true) || "some time"} ago (${d.momentUTC(role.createdAt)})`
      )
      .addField(`Permissions (use ${p}perms)`, permsz, true)
      .addField(`Is externally managed`, d.Constants.maps.YESNO[Boolean(role.managed)], true)
      .addField("Display Color (See sidebar)", color + (isDefault ? " (Default)" : ""), true)
      .addField(`Is displayed separately`, d.Constants.maps.YESNO[Boolean(role.hoist)], true)
      .addField("Position", position, true)
      .addField("Is mentionable", d.Constants.maps.YESNO[Boolean(role.mentionable)], true)
      .addField(
        `Members${membersArr.length ? ` (${membersArr.length})` : ""}`,
        membersJoined.length > d.Constants.numbers.max.chars.FIELD ?
          `Use \`\`${p}info members ${d.escMarkdown(role.name)}\`\` to see (too long)` :
          (
            membersJoined ||
            "No members"
          )
      )
      .setFooter(`Role ID: ${role.id} | Server ID: ${guild.id}`);
    return sendIt(embed);
  } else if (is(
    "channel", "textchannel", "text", "textid", "channelid", "textchannelid", "voice", "voicechannel", "voiceid",
    "voicechannelid", "category", "categoryid", "ctg", "ctgid"
  )) {
    if (
      guild &&
      (
        is("category", "categoryid") && guild.channels.filter(c => c.type === "category").size < 1 ||
        is("voice", "voicechannel", "voiceid", "voicechannelid") && guild.channels.filter(c => c.type === "voice").size < 1
      )
    ) {
      if (is("category", "ctg", "ctgid", "categoryid")) return reply("There are no categories in this server!");
      return reply("There are no voice channels in this server!");
    }
    let isID = action.endsWith("id");
    let type, typeUsed, chnl;
    if (action.startsWith("text") || (action.startsWith("channel") && !trArg.startsWith("&"))) {
      type = "text";
    } else if (action.startsWith("voice") || (action.startsWith("channel") && trArg.startsWith("&"))) {
      type = "voice";
    } else {
      type = "category";
    }
    const lArg = trArg.replace(/^[#&]/, "");
    if (!lArg) {
      if (guild) {
        if (type === "text") {
          chnl = channel;
        } else if (type === "voice" && member.voiceChannel) {
          chnl = member.voiceChannel;
        } else {
          chnl = guild.channels.filter(c => c.type === type).sort((a, b) => b.position - a.position).last();
        }
      } else {
        return send("Please specify a channel (by mentioning it) or a channel ID!");
      }
    } else {
      const { subject } = await (d.search(lArg, "channel", self, { channelType: type, allowForeign: true }));
      if (!subject) return;
      chnl = subject;
    }
    typeUsed = chnl.type;
    if (isID) {
      return reply(`The ID of the ${typeUsed === "category" ? "category" : `${typeUsed} channel`} named \
\`${d.escMarkdown(chnl.name)}\` is ${chnl.id}.`);
    }
    channel.startTyping();
    const dir = d.Constants.images.CHANNEL_INFO[chnl.nsfw ? "TEXT_NSFW" : typeUsed.toUpperCase()];
    
    const embed = new d.Embed() // general embed
      .setAuthor(
        `Info for ${typeUsed === "category" ? "category" : typeUsed + " channel"} "${chnl.name}"`,
        d.Constants.images.CHANNEL_INFO[typeUsed.toUpperCase()]
      )
      .setDescription(
        `Was created ${d.ago(chnl.createdAt, Date.now(), true) || "some time"} ago (${d.momentUTC(chnl.createdAt)})\
${guild ? (guild.channels.has(chnl.id) ? "" : "\n\nThis channel is from another server.") : ""}`
      )
      .setThumbnail(dir)
      .setColor("#CABE40")
      .setFooter(`${type === "category" ? "Category" : "Channel"} ID: ${chnl.id}`)
      .addField(
        `${chnl.parent ? "Relative " : ""}${typeUsed === "voice" ? "Voice " : ""}Position`,
        chnl.position,
        true
      )
      .addField(`Permission Overwrites`, chnl.permissionOverwrites.size, true);
    if (chnl.parent) embed.addField(`Category`, chnl.parent.name, true);
    if (typeUsed === "text" || typeUsed === "voice") {
      let invs;
      try {
        invs = await chnl.fetchInvites();
      } catch (err) { /* shrug */ }
      const membersArr = chnl.members
        .array()
        .sort((a, b) => a.displayName > b.displayName);
      const membersJoined = membersArr.length === guild.members.size ? "All members" : membersArr.join(", ");
      if (typeUsed === "text") {
        let whs;
        try {
          whs = await chnl.fetchWebhooks();
        } catch (err) { /* shrug */ }
        embed
          .addField("Is NSFW", d.Constants.maps.YESNO[Boolean(chnl.nsfw)], true)
          .addField("Webhook Amount", whs ? whs.size : "Unable to view", true)
          .addField("Topic", chnl.topic || "None", true)
          .addField(
            `Members who can read this channel${membersArr.length < 1 ? "" : ` (${membersArr.length})`}`,
            membersJoined.length > d.Constants.numbers.max.chars.FIELD ?
              `Use \`\`${p}info channelmembers ${d.escMarkdown(chnl.name)}\`\` to see (too long)` :
              (
                membersJoined ||
                "No members"
              ),
            false
          );
      } else if (typeUsed === "voice") {
        embed
          .addField("Bitrate", `${chnl.bitrate / 1000} kbps`, true)
          .addField("User Limit", chnl.userLimit || "Unlimited", true)
          .addField("Is full", d.Constants.maps.YESNO[Boolean(chnl.full)], true)
          .addField(
            `Members Connected\
${membersArr.length < 1 ? "" : ` (${membersArr.length + (chnl.userLimit ? `/${chnl.userLimit}` : "")})`}`,
            membersJoined.length > d.Constants.numbers.max.chars.FIELD ?
              `Use \`\`${p}info voicemembers ${d.escMarkdown(chnl.name)}\`\` to see (too long)` :
              (
                membersJoined ||
                "No members"
              ), 
            false
          );
      }
    } else if (typeUsed === "category") {
      const globalPos = d.globalPosition(chnl.guild);
      const chArr = chnl.children
        .array()
        .sort((a, b) => globalPos.get(b.id).position - globalPos.get(a.id).position);
      const chJoined = chArr.length === globalPos.size ? "All channels" : chArr.join(", ");

      embed
        .addField(
          `Channels Within${chArr.length < 1 ? "" : ` (${chArr.length})`}`,
          chJoined.length > d.Constants.numbers.max.chars.FIELD ?
            `Use \`\`${p}info categorychildren ${d.escMarkdown(chnl.name)}\`\` to see (too long)` :
            (
              chJoined ||
              "No sub-channels"
            )
        );
    }
    return sendIt(embed);
  } else if (is("server", "guild", "guildid", "serverid")) {
    if (is("serverid", "guildid")) return reply(`The ID of the current server is ${guildId}.`);
    channel.startTyping();
    const icon = guild.iconURL();
    const emb = new d.Embed()
      .setAuthor(
        guild.name,
        icon,
        icon
      )
      .setDescription(
        `Was created ${d.ago(guild.createdAt, Date.now(), true) || "some time"} ago (${d.momentUTC(guild.createdAt)})`
      )
      .setThumbnail(icon || d.Constants.images.SERVER_INFO.NO_ICON)
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
      .addField("Region", d.adaptSnake(guild.region), true)
      .addField("Verification Level", d.Constants.maps.VERIF[guild.verificationLevel], true);
      if (guild.features.length) emb.addField("Features", d.adaptSnake(guild.features) || "None");
    return sendIt(emb);
  } else if (is("bot", "stats", "botid", "statsid")) {
    if (is("botid", "statsid")) return reply(`My ID is ${d.bot.user.id}.`);
    channel.startTyping();
    const av = d.bot.user.displayAvatarURL();
    const created = d.bot.user.createdAt;
    const pgHere = guild.members.has(d.Constants.identifiers.OWNER);
    const apletHere = guild.members.has(d.Constants.identifiers.APLET);
    const checkTotal = async (name, prop, possible, not = false) => {
      try {
        if (prop) return await (d.cross[name].filter(s => {
          const incl = possible.includes(s[prop]);
          if (not) return !incl;
          return incl;
        }, { prop, possible, not }).size());
        return await (d.cross[name].size());
      } catch (err) { d.rejct(err, `[CHECK-TOTAL ${name}]`); }
    };
    const totalChannels = await checkTotal("channels", "type", ["text", "voice"]);
    const totalGuilds = await checkTotal("guilds");
    const totalCategories = await checkTotal("channels", "type", ["category"]);
    const totalText = await checkTotal("channels", "type", ["text"]);
    const totalVoice = await checkTotal("channels", "type", ["voice"]);
    const totalUsers = await checkTotal("users");
    const emb = new d.Embed()
      .setAuthor(d.bot.user.username, av, av)
      .setThumbnail(av)
      .setFooter(`Click the title for avatar URL | My ID: ${d.bot.user.id} | Happy to be alive! ^-^`)
      .setDescription(`Was created ${d.ago(created, Date.now(), true) || "some time"} ago (${d.momentUTC(created)})`)
      .addField("Developers", `🔥PgSuper🔥#3693 (<@${pgHere ? "!" : ""}${d.Constants.identifiers.OWNER}>) and \
Aplet123#9551 (<@${apletHere ? "!" : ""}${d.Constants.identifiers.APLET}>)`, false)
      .addField("Uptime", new d.Interval(d.bot.uptime).toString(true), true)
      .addField("Programming Language", "JavaScript", true)
      .addField("Library", "discord.js", true)
      .addField("Servers", totalGuilds, true)
      .addField("Users", totalUsers, true)
      .addField("Total Channels", totalChannels, true)
      .addField("Total Categories", totalCategories, true)
      .addField("Text Channels", totalText, true)
      .addField("Voice Channels", totalVoice, true);
    return sendIt(emb);
  } else if (is(
    "roles",
    "channels", "textchannels", "texts",
    "voices", "voicechannels",
    "categories", "ctgs",
    "members"
  )) {
    if (!perms["info.roles"]) return reply("Missing permission `info roles`! :frowning:");
    channel.startTyping();
    let content, invalid, title, subjects, page, argu;
    // specific to types
    let noArgCont, argCont, noArgInvalid, argInvalid, noArgTitle, argTitle, type, guildWide, subjectProp, channelType, sort,
    textWorker, filterer;
    const sepArg = trArg.split(" ");
    if (/^\d+$/.test(sepArg[sepArg.length - 1])) {
      page = sepArg.pop();
    } else {
      page = "1";
    }
    argu = sepArg.join(" ");
    let channelPlurals, channelPlural;
    switch (action) {
      case "roles":
        noArgCont = "Here are the server's roles:";
        noArgInvalid = "This server has no roles (other than the default)!";
        noArgTitle = "All Roles";
        
        argCont = `Here are {user.tag}'s roles:`;
        argInvalid = "That member has no roles (other than the default)!";
        argTitle = `{user.tag}'s Roles`;

        type = "user";
        guildWide = guild.roles;
        sort = (a, b) => b.position - a.position;
        textWorker = (role, arr, isGRoles) => {
          const rolePos = arr.indexOf(role);
          const position = rolePos < 1 ?
          (isGRoles ? "Top" : "Highest") :
          (
            rolePos === arr.length - 1 ?
              (isGRoles ? "Bottom" : "Lowest") :
              arr.length - 1 - rolePos // rolesArr length - rolePos to reverse the sorting; - 1 to keep zero-indexed
          );
          return `**${isNaN(position) ? `${position}:` : `${position}.`}** <@&${role.id}>`;
        };
        filterer = r => r.id !== guild.id;
        subjectProp = "roles";
        break;
      case "channels":
      case "texts":
      case "textchannels":
      case "voices":
      case "voicechannels":
      case "categories":
      case "ctgs":
        channelPlurals = {
          channels: "channels",
          texts: "text channels",
          textchannels: "text channels",
          voices: "voice channels",
          voicechannels: "voice channels",
          categories: "categories",
          ctgs: "categories"
        };
        channelPlural = channelPlurals[action];

        noArgCont = "Here are the server's text channels:";
        noArgInvalid = "This server has no channels!";
        noArgTitle = "All Channels";
        
        argCont = "Here are the channels for the category `{name}`:";
        argInvalid = "That category has no channels!";
        argTitle = `{name}'s Inner Channels`;

        type = "channel";
        channelType = "";
        guildWide = guild.channels.filter(c => ["text", "voice"].includes(c.type));
        sort = (a, b) => ((d.globalPosition(b.guild).get(b.id) - d.globalPosition(a.guild).get(a.id)) || b.id - a.id);
        subjectProp = "channels";
        break;
      
    }
    if (!trArg || /^\d{1,5}$/.test(trArg)) {
      subjects = guildWide;
      content = noArgCont;
      invalid = noArgInvalid;
      title = noArgTitle;
    } else {
      let subject;
      const searched = await (d.search(argu, type, self, { channelType, allowForeign: false }));
      if (searched.subject) {
        subject = type === "user" ? guild.member(searched.subject) : searched.subject;
      } else {
        return;
      }
      subjects = d.followPath(subject, subjectProp);
      content = argCont.replace(/\{[\w\.]+\}/g, str => d.followPath(subject, str.match(/\{([\w\.]+)\}/g)[1]));
      invalid = argInvalid.replace(/\{[\w\.]+\}/g, str => d.followPath(subject, str.match(/\{([\w\.]+)\}/g)[1]));
      title = argTitle.replace(/\{[\w\.]+\}/g, str => d.followPath(subject, str.match(/\{([\w\.]+)\}/g)[1]));
    }
    const arr = subjects.array().sort(sort).filter(filterer || (() => true));
    if (arr.length < 1) return reply(invalid);
    const isG = subjects === guildWide;
    const pages = d.paginate(arr);
    if (page.length > 5) {
      page = 1;
    } else {
      page = Number(page);
    }
    const gen = page => {
      page = d._.clamp(isNaN(page) ? 1 : page, 1, pages.length);
      const emb = new d.Embed()
        .setAuthor(title + ` (${arr.length}) - Page ${page}/${pages.length}`);
      if (pages.length > 1) emb.setFooter(`To go to a specific page, write ${p}info ${action} \
${argu ? argu + "<page>" : "<page>"}.`);
      let desc = "";
      for (const subj of pages[page - 1]) {
        if (subj.id === guild.id && type === "role") continue;
        desc += textWorker(subj, arr, isG);
      }
      emb.setDescription(d._.trim(desc));
      return emb;
    };
    const paginate = {
      page,
      maxPage: pages.length,
      pages,
      usePages: true,
      format: gen,
      content
    };
    await d.sleep(200); // to maek typing count
    return sendIt(gen(page), { content, paginate });
  }
  return;
};
module.exports = new Command({
  func,
  name: "info",
  perms: {
    "info.user": true, "info.role": true, "info.channel": true, "info.server": true,
    "info.bot": true, "info.roles": true, "info.channels": true, "info.members": true,
    "info.perms": true, "info.saltperms": true
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
    },
    channelinfo: {
      description: "Alias to info channel (See `channel` for managing channels). Specify a channel to view its info",
      action: "channel",
      perms: "info.channel",
      args: { channel: true },
      example: `
{p}channelinfo
{p}channelinfo #text-channel
{p}channelinfo &Voice Channel
{p}channelinfo 123456789`,
      default: true
    },
    channelid: {
      description: "Alias to info channelid. Specify a channel to view its ID",
      action: "channelid",
      perms: "info.channel",
      args: { channel: true },
      example: `
{p}channelid
{p}channelid #text-channel
{p}channelid &Voice Channel
{p}channelid 123456789`,
      default: true
    },
    voiceinfo: {
      description: "Alias to info voice (See `voicechannel` for managing voicechannels). Specify a voicechannel to view its \
info",
      action: "voice",
      perms: "info.channel",
      args: { voicechannel: true },
      example: `
{p}voiceinfo
{p}voiceinfo Music
{p}voiceinfo 123456789`,
      default: true
    },
    voiceid: {
      description: "Alias to info voiceid. Specify a voice channel to view its ID",
      action: "voiceid",
      perms: "info.channel",
      args: { voicechannel: true },
      example: `
{p}voiceid
{p}voiceid Music
{p}voiceid 123456789`,
      default: true
    },
    categoryinfo: {
      description: "Alias to info category (See `category` for managing categories). Specify a category to view its \
info",
      action: "category",
      perms: "info.channel",
      args: { category: true },
      example: `
{p}categoryinfo
{p}categoryinfo Cool Channels
{p}categoryinfo 123456789`,
      default: true
    },
    ctginfo: {
      description: "Alias to info category (See `category` for managing categories). Specify a category to view its \
info",
      action: "category",
      perms: "info.channel",
      args: { category: true },
      example: `
{p}ctginfo
{p}ctginfo Cool Channels
{p}ctginfo 123456789`,
      default: true
    },
    categoryid: {
      description: "Alias to info categoryid. Specify a category channel to view its ID",
      action: "categoryid",
      perms: "info.channel",
      args: { category: true },
      example: `
{p}categoryid
{p}categoryid Cool Channels
{p}categoryid 123456789`,
      default: true
    },
    ctgid: {
      description: "Alias to info categoryid. Specify a category channel to view its ID",
      action: "categoryid",
      perms: "info.channel",
      args: { category: true },
      example: `
{p}ctgid
{p}ctgid Cool Channels
{p}ctgid 123456789`,
      default: true
    },
    serverinfo: {
      description: "Alias to info server. View info of current server",
      action: "server",
      perms: "info.server",
      args: {},
      example: `
{p}serverinfo`,
      default: true
    },
    guildinfo: {
      description: "Alias to info guild. View info of current server",
      action: "guild",
      perms: "info.server",
      args: {},
      example: `
{p}guildinfo`,
      default: true
    },
    serverid: {
      description: "Alias to info serverid. View ID of current server",
      action: "serverid",
      perms: "info.server",
      args: {},
      example: `
{p}serverid`,
      default: true
    },
    guildid: {
      description: "Alias to info guildid. View ID of current server",
      action: "guildid",
      perms: "info.server",
      args: {},
      example: `
{p}guildid`,
      default: true
    },
    bot: {
      description: "Alias to info bot. View my info",
      action: "bot",
      perms: "info.bot",
      args: {},
      example: `
{p}bot`,
      default: true
    },
    botinfo: {
      description: "Alias to info bot. View my info",
      action: "bot",
      perms: "info.bot",
      args: {},
      example: `
{p}botinfo`,
      default: true
    },
    botid: {
      description: "Alias to info botid. View my ID",
      action: "botid",
      perms: "info.bot",
      args: {},
      example: `
{p}botid`,
      default: true
    },
    stats: {
      description: "Alias to info stats. View my info",
      action: "stats",
      perms: "info.bot",
      args: {},
      example: `
{p}stats`,
      default: true
    },
    statsinfo: {
      description: "Alias to info stats. View my info",
      action: "stats",
      perms: "info.bot",
      args: {},
      example: `
{p}statsinfo`,
      default: true
    },
    statsid: {
      description: "Alias to info statsid. View my ID",
      action: "statsid",
      perms: "info.bot",
      args: {},
      example: `
{p}statsid`,
      default: true
    },
    roles: {
      description: "Alias to info roles. View all or a member's roles.",
      action: "roles",
      perms: "info.roles",
      args: { "member or page": true, "page (if member is specified)": true },
      example: `
{p}roles
{p}roles 2
{p}roles Guy#0000 3`,
      default: true
    }
  },
  guildOnly: false
});