const { Collection, GuildMember, Message, MessageEmbed, TextChannel, User } = require("discord.js");
const Command = require("../../classes/command");
const Searcher = require("../../classes/searcher");
const { bot, logger, util } = require("../../util/deps");
const { rejct } = require("../../util/funcs");

function getAvatarEmb(author) {
  const avatarRegex = /^((?:https?:\/\/)cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpe?g|png|gif|webp))\?size=\d+$/;
  const embed = new MessageEmbed();
  const tag = `${author.username}#${author.discriminator}`;
  const urlz = author.displayAvatarURL();
  const avatarUrl = avatarRegex.test(urlz) ?
  urlz.match(avatarRegex)[1]
  : urlz;

  embed.setAuthor(`${tag}'s Avatar`, avatarUrl, avatarUrl)
    .setImage(avatarUrl)
    .setFooter(`User's ID: ${author.id}`);

  return embed;
}

const func = async function (msg, {
  channel, guildId, author, args, arrArgs, send, reply, searcher, promptAmbig,
}) {
  if (arrArgs.length < 1 || !(channel instanceof TextChannel)) {
    if (!(channel instanceof TextChannel)) {
      author = bot.user;
    }
    const embed = getAvatarEmb(author);
    send(`${arrArgs.length > 0 ?
      "This is a DM and there is nobody here other than me and you, so here's my avatar." :
      ""}`, { embed });
  } else {
    if (/^<@\d+>$/.test(args)) {
      const user = bot.users.get(args.match(/^<@(\d+)>$/)[1]);
      if (!user) {
        return reply("Invalid member given!");
      }
      const embed = getAvatarEmb(user);
      return send({ embed });
    }
    const members = searcher.searchMember(args);
    logger.debug(args);
    if (members.length < 1) {
      return reply("Member not found!");
    }
    if (members.length > 1 && members.length < 10) {
      const ambResult = await promptAmbig(members);
      if (ambResult.cancelled) {
        return;
      }
      if (ambResult.member) {
        const member = ambResult.member;
        const embed = getAvatarEmb(member.user);
        send({ embed });
        return;
      }
    }
    if (members.length === 1) {
      const embed = getAvatarEmb(members[0].user);
      send({ embed });
      return;
    }
    return reply("Multiple members were found in your search. Please be more specific.");
  }
};
module.exports = new Command({
  func,
  name: "avatar",
  perms: "avatar",
  default: true,
  description: "View the avatar of you or someone else.",
  example: "{p}avatar",
  category: "Utility",
  args: {member: true},
  guildOnly: false,
});
