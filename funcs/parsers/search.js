const { bot, cross, Constants, Searcher } = require("../../util/deps");
const capitalize = require("../strings/capitalize");
const rejct = require("../util/rejct");
const reasons = {
  OK: 0,
  NOT_FOUND: 1,
  ALREADY_ANSWERED: 2,
  NONE_AVAILABLE: 3,
  BE_MORE_SPECIFIC: 4,
  OUTSIDE_GUILD: 5,
  UNKNOWN: 4
};

/**
 * 
 * @param {string} args Info provided for lookup
 * @param {"user" | "channel" | "roles" | "emoji"} type Type of search
 * @param {object} context Context (guild, send, reply, promptAmbig)
 * @param {object} options Options
 * @param {"text"|"voice"|"category"|"all"} [options.channelType="text"] Channel type
 * @param {boolean} [options.allowForeign=false] Allow foreign subjects
 * @param {boolean} [options.autoAnswer=true] If should automatically answer
 */
const func = async function search(
  args, type, { guild, send, reply, promptAmbig }, {
    channelType = "text", allowForeign = false, autoAnswer = true
  } = {}
) {
  type = String(type).toLowerCase();
  const searcher = new Searcher({ guild });
  const plural = {
    user: "members",
    channel: "channels",
    role: "roles",
    emoji: "emojis"
  };
  const term = type === "user" ?
    "member" :
    (
      type === "channel" ?
        (
          channelType === "category" ?
            channelType :
            "channel"
        ) :
      type
    );
  let subject, mentionRegex, field, valid, foreignMsg;
  let result = { subject: null, reason: reasons.UNKNOWN };
  const finish = function(reason, answer) {
    result.reason = reason;
    if (autoAnswer && answer) {
      reply(answer);
      result.reason = reasons.ALREADY_ANSWERED;
    }
    return result;
  };
  switch (type) {
    case "user":
      mentionRegex = Constants.regex.MENTION;
      field = valid = cross.users;
      foreignMsg = `Please specify a valid username followed by a valid discriminator (e.g. \`User#1234\`), a valid \
user ID (e.g. \`80351110224678912\`) or a mention (e.g. @Sir#0001).`;
      break;

    case "channel":
      mentionRegex = Constants.regex.CHANNEL_MENTION;
      field = valid = cross.channels;
      foreignMsg = `Please specify a valid ${channelType === "category" ? "category" : channelType + " channel"} name \
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
      field = valid = cross.emojis;
      break;

    default:
      throw new TypeError(`Invalid type "${type}"! Must be user, channel, emoji or role.`);
  }
  if (type !== "role" && !allowForeign) {
    valid = guild[plural[type]];
  }
  if (!valid || valid.size < 1) {
    return finish(reasons.NONE_AVAILABLE, `No ${type}s available for search! :frowning:`);
  }
  Constants.regex.ID.test((args), mentionRegex.test(args), args);
  if (type === "user" && Constants.regex.NAME_AND_DISCRIM.test(args)) {
    subject = await (valid.find("tag", args));
  } else if (Constants.regex.ID.test(args) || mentionRegex.test(args)) {
    try {
      const matched = args.match(Constants.regex.ID.test(args) ? Constants.regex.ID : mentionRegex)[1];
      if (await (valid.has(matched))) {
        subject = await (valid.get(matched));
      } else if (allowForeign && type === "user") {
        subject = await bot.users.fetch(matched);
      }
    } catch(err) {
      if (!/Unknown/i.test(err)) rejct(err, "[SEARCH-GETID]");
      return finish(reasons.NOT_FOUND, `Unknown ${type}!`);
    }
  }
  if (!subject) {
    if (!guild) {
      return finish(reasons.OUTSIDE_GUILD, allowForeign ? foreignMsg : `Please run this command in a server!`);
    } else {
      const subjectsMatched = searcher["search" + capitalize(type === "user" ? "member" : type)](
        args,
        type === "channel" ? channelType : undefined
      );
      let subjectToUse;
      if (subjectsMatched) {
        if (subjectsMatched.length < 1) {
          return finish(reasons.NOT_FOUND, `${capitalize(term)} not found!`);
        } else if (subjectsMatched.length === 1) {
          subjectToUse = subjectsMatched[0];
        } else if (subjectsMatched.length > 1 && subjectsMatched.length < 10) {
          const result = await promptAmbig(subjectsMatched);
          if (result.cancelled) {
            return;
          }
          subjectToUse = result.subject;
        } else {
          return finish(reasons.BE_MORE_SPECIFIC, `Multiple ${type === "category" ? "categorie" : type}s have matched your \
search. Please be more specific.`);
        }
      }
      if (!subjectToUse) return reply(capitalize(type) + " not found! :thinking:");
      subject = subjectToUse.user || subjectToUse;
    }
  }
  if (!subject) return finish(reasons.NOT_FOUND, `${capitalize(term)} not found!`);
  result.subject = subject;
  return finish(reasons.OK);
};
func.reasons = reasons;

module.exports = func;
