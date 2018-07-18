import Command from "../../classes/command";
import { TextChannel, Embed, logger, bot, User, GuildMember } from "../../misc/d";
import { cmdFunc } from "../../misc/contextType";

/**
 * Get the embed of an avatar of an user
 * @param {User} author The user to get avatar from
 * @returns {Embed}
 */
function getAvatarEmb(author: User): Embed {
  const avatarRegex: RegExp = /^((?:https?:\/\/)?cdn\.discordapp\.com\/avatars\/\d+\/\w+\.(?:jpe?g|png|gif|webp))\?size=\d+$/;
  const embed: Embed = new Embed();
  const tag: string = `${author.username}#${author.discriminator}`;
  const urlz: string = author.displayAvatarURL();
  const avatarUrl: string = avatarRegex.test(urlz) ?
  urlz.match(avatarRegex)[1]
  : urlz;

  embed.setAuthor(`${tag}'s Avatar`, avatarUrl, avatarUrl)
    .setImage(avatarUrl)
    .setFooter(`User's ID: ${author.id}`);

  return embed;
}

const func: cmdFunc = async function(msg, {
  channel, guildId, author, args, arrArgs, send, reply, searcher, promptAmbig, perms, guild
}) {
  if (guild && !perms.avatar) return reply("Missing permission `avatar`! :frowning:");
  channel.startTyping();
  if (!args) {
    send({ embed: getAvatarEmb(author), deletable: true });
  } else if (!(channel instanceof TextChannel)) {
    send(
      "This is a DM and there is nobody here other than me and you, so here's my avatar.",
      { embed: getAvatarEmb(bot.user), deletable: true }
    );
  } else {
    if (/^<@\d+>$/.test(args)) {
      const user: User = bot.users.get(args.match(/^<@(\d+)>$/)[1]);
      if (!user) {
        return reply("Invalid member given!");
      }
      const embed: Embed = getAvatarEmb(user);
      return send({ embed, deletable: true });
    }
    const members: GuildMember[] = searcher.searchMember(args);
    logger.debug(args);
    if (members.length < 1) {
      return reply("Member not found!");
    }
    if (members.length > 1 && members.length < 10) {
      const ambResult = await promptAmbig(members);
      if (ambResult.cancelled) {
        return;
      }
      if (ambResult.subject) {
        const member: GuildMember = ambResult.subject;
        const embed: Embed = getAvatarEmb(member.user);
        send({ embed, deletable: true });
        return;
      }
    }
    if (members.length === 1) {
      const embed: Embed = getAvatarEmb(members[0].user);
      send({ embed, deletable: true });
      return;
    }
    return reply("Multiple members were found in your search. Please be more specific.");
  }
};

export const avatar = new Command({
  func,
  name: "avatar",
  perms: "avatar",
  default: true,
  description: "View the avatar of you or someone else.",
  example: "{p}avatar",
  category: "Utility",
  args: {member: true},
  guildOnly: false
});
