const { bot, Constants, Searcher } = require("../../util/deps");
const capitalize = require("../strings/capitalize");
const reasons = {
  OK: 0,
  NOT_FOUND: 1,
  ALREADY_ANSWERED: 2,
  NONE_AVAILABLE: 3,
  UNKNOWN: 4
};
// TODO: FINISH
const func = async function search(
  args, type, { context: { guild, send, reply, promptAmbig }, channelType = "text", allowForeign = false }
) {
  type = String(type).toLowerCase();
  const searcher = new Searcher({ guild });
  const plural = {
    user: "subjects",
    channel: "channels",
    role: "roles",
    emoji: "emojis"
  };
  let subject, mentionRegex, field, valid, foreignMsg;
  let result = { subject: null, reason: reasons.UNKNOWN };
  switch (type) {
    case "user":
      mentionRegex = Constants.regex.MENTION;
      field = valid = bot.users;
      foreignMsg = `Please specify a valid username followed by a valid discriminator (e.g. \`User#1234\`), a valid \
user ID (e.g. \`80351110224678912\`) or a mention (e.g. @Sir#0001).`;
      break;

    case "channel":
      mentionRegex = Constants.regex.CHANNEL_MENTION;
      field = bot.channels;
      foreignMsg = `Please specify a valid ${channelType === "category" ? "category" : "${channelType} channel"} name \
(e.g. ${channelType === "text" ? "#place" : "Place"}) or mention (e.g. <\\#276430581468889089>).`;
      break;

    case "role":
      mentionRegex = Constants.regex.ROLE_MENTION;
      field = valid = guild.roles;
      foreignMsg = `Please specify a valid role name (e.g. Cool People) or mention (e.g. <\\@&413452080834019368>).`;
      allowForeign = false;
      break;

    case "emoji":
      mentionRegex = Constants.regex.EMOJI_MENTION;
      foreignMsg = `Please specify a valid custom emoji.`;
      field = valid = bot.emojis;
      break;

    default:
      throw new TypeError(`Invalid type "${type}"! Must be user, channel, emoji or role.`);
  }
  if (type !== "role" && !allowForeign) {
    valid = valid.filter(s => guild[plural[type]].has(s.id));
  }
  if (!valid || valid.size < 1) {
    result.reason = reasons.NONE_AVAILABLE;
    return result;
  }
  if (type === "user" && Constants.regex.NAME_AND_DISCRIM.test(args)) {
    subject = valid.find("tag", args);
  } else if (Constants.regex.ID.test(args) || mentionRegex.test(args)) {
    try {
      const matched = args.match(Constants.regex.ID.test(args) ? Constants.regex.ID : mentionRegex)[1];
      if (valid.has(matched)) {
        subject = valid.get(matched);
      } else if (allowForeign && type === "user") {
        subject = await field.fetch(matched);
      }
    } catch(err) {
      reply(`Unknown ${type}!`);
      result.reason = reasons.ALREADY_ANSWERED;
      return result;
    }
  }
  if (!subject) {
    if (!guild) {
      if (allowForeign) {
        reply(foreignMsg);
      } else {
        reply("Please run this command on a guild!");
      }
      result.reason = reasons.ALREADY_ANSWERED;
      return result;
    } else {
      const subjectsMatched = searcher[search + capitalize(type === "user" ? "member" : type)](args);
      let subjectToUse;
      if (subjectsMatched) {
        if (subjectsMatched.length < 1) {
          return reply("Member not found!");
        } else if (subjectsMatched.length === 1) {
          subjectToUse = subjectsMatched[0];
        } else if (subjectsMatched.length > 1 && subjectsMatched.length < 10) {
          const result = await promptAmbig(subjectsMatched);
          if (result.cancelled) {
            return;
          }
          subjectToUse = result.subject;
        } else {
          reply(`Multiple ${type}s have matched your search. Please be more specific.`);
          result.reason = reasons.ALREADY_ANSWERED;
          return result;
        }
      }
      if (!subjectToUse || !subjectToUse.user) return reply(capitalize(type) + " not found! :thinking:");
      subject = subjectToUse.user;
    }
  }
}