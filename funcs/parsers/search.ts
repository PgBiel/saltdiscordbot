import { bot, cross, Constants, Searcher } from "../../util/deps";
import capitalize from "../strings/capitalize";
import rejct from "../util/rejct";
import { Guild, Role, User, GuildEmoji, TextChannel, GuildMember, Collection, GuildChannel } from "discord.js";
import { ExtendedSendUnit } from "../../handlerfuncs/senders/proto-send";
import { HandlerFuncs } from "../../handlerfuncs/commandHandlerFuncs";
import { CrossItem } from "../../classes/cross";
import { AnyChannel } from "../clean/uncleanChannel";
import { ArrayContents } from "../../classes/database";
import { PromptAmbigSubject } from "../../handlerfuncs/prompts/promptAmbig";
const reasons: {
  OK: 0;
  NOT_FOUND: 1;
  ALREADY_ANSWERED: 2;
  NONE_AVAILABLE: 3;
  BE_MORE_SPECIFIC: 4;
  OUTSIDE_GUILD: 5;
  UNKNOWN: 4;
} = {
  OK: 0,
  NOT_FOUND: 1,
  ALREADY_ANSWERED: 2,
  NONE_AVAILABLE: 3,
  BE_MORE_SPECIFIC: 4,
  OUTSIDE_GUILD: 5,
  UNKNOWN: 4
};

export type SearchReason = 0 | 1 | 2 | 3 | 4 | 5;

export type SearchType = "user" | "channel" | "role" | "emoji";

type SearchResult = Role | User | GuildEmoji | AnyChannel;

type SearchField<T = SearchResult> = CrossItem<T> | Collection<string, T>;

export interface ISearchContext {
  guild?: Guild;
  send: ExtendedSendUnit;
  reply: ExtendedSendUnit;
  promptAmbig: HandlerFuncs["promptAmbig"];
}

interface ISearchReturn<S = SearchResult> {
  reason: SearchReason;
  subject?: S;
}

interface ISearchOpts {
  channelType?: "text" | "voice" | "category" | "all";
  allowForeign?: boolean;
  autoAnswer?: boolean;
}

/**
 *
 * @param {string} args Info provided for lookup
 * @param {"user" | "channel" | "role" | "emoji"} type Type of search
 * @param {object} context Context (guild, send, reply, promptAmbig)
 * @param {object} options Options
 * @param {"text"|"voice"|"category"|"all"} [options.channelType="text"] Channel type
 * @param {boolean} [options.allowForeign=false] Allow foreign subjects
 * @param {boolean} [options.autoAnswer=true] If should automatically answer
 */
async function search(
  args: string, type: "role", { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType, allowForeign, autoAnswer
  }?: ISearchOpts
): Promise<ISearchReturn<Role>>;
async function search(
  args: string, type: "user", { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType, allowForeign, autoAnswer
  }?: ISearchOpts
): Promise<ISearchReturn<User>>;
async function search(
  args: string, type: "emoji", { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType, allowForeign, autoAnswer
  }?: ISearchOpts
): Promise<ISearchReturn<GuildEmoji>>;
async function search(
  args: string, type: "channel", { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType, allowForeign, autoAnswer
  }?: ISearchOpts
): Promise<ISearchReturn<AnyChannel>>;
async function search(
  args: string, type: SearchType, { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType, allowForeign, autoAnswer
  }?: ISearchOpts
): Promise<ISearchReturn<SearchResult>>;
async function search(
  args: string, type: SearchType, { guild, send, reply, promptAmbig }: ISearchContext, {
    channelType = "text", allowForeign = false, autoAnswer = true
  }: ISearchOpts = {}
): Promise<ISearchReturn<SearchResult>> { // todo: finish
  type = String(type).toLowerCase() as SearchType;
  const searcher: Searcher<GuildMember> = new Searcher({ guild });
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
  let subject: SearchResult;
  let mentionRegex: RegExp;
  let field: SearchField;
  let valid: typeof field;
  let foreignMsg: string;
  const result: ISearchReturn = { subject: null, reason: reasons.UNKNOWN };
  const finish = (reason: SearchReason, answer?: string) => {
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
      foreignMsg = `Please specify a valid user tag (username followed by discriminator, e.g. \`User#1234\`), a valid \
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
  if (type !== "role" && guild && !allowForeign) {
    valid = guild[plural[type]];
  }
  if (!valid || (typeof valid.size === "function" ? (await valid.size()) : valid.size) < 1) {
    return finish(reasons.NONE_AVAILABLE, `No ${type}s available for search! :frowning:`);
  }
  if (type === "user" && Constants.regex.NAME_AND_DISCRIM.test(args)) {
    subject = await ((valid as SearchField<User>).find("tag", args));
  } else if (Constants.regex.ID.test(args) || mentionRegex.test(args)) {
    try {
      const matched: string = args.match(Constants.regex.ID.test(args) ? Constants.regex.ID : mentionRegex)[1];
      if (await (valid.has(matched))) {
        subject = await (valid.get(matched));
      } else if (allowForeign && type === "user") {
        subject = await bot.users.fetch(matched);
      }
    } catch (err) {
      if (!/Unknown/i.test(err)) rejct(err, "[SEARCH-GETID]");
      return finish(reasons.NOT_FOUND, `Unknown ${type}!`);
    }
  }
  if (!subject) {
    if (!guild) {
      return finish(reasons.OUTSIDE_GUILD, allowForeign ? foreignMsg : `Please run this command in a server!`);
    } else {
      let subjectsMatched: Array<GuildMember | GuildChannel | GuildEmoji | Role>;
      switch (type) {
        case "user":
          subjectsMatched = searcher.searchMember(args);
          break;

        case "channel":
          subjectsMatched = searcher.searchChannel(args, channelType);
          break;

        case "role":
          subjectsMatched = searcher.searchRole(args);
          break;

        case "emoji":
          // subjectsMatched = searcher.searchEmoji(args); - TODO: Add search emoji
          break;
      }
      let subjectToUse: ArrayContents<typeof subjectsMatched>;
      if (subjectsMatched) {
        if (subjectsMatched.length < 1) {
          return finish(reasons.NOT_FOUND, `${capitalize(term)} not found!`);
        } else if (subjectsMatched.length === 1) {
          subjectToUse = subjectsMatched[0];
        } else if (subjectsMatched.length > 1 && subjectsMatched.length < 10) {
          const result = await promptAmbig(
            subjectsMatched, plural[type], { type: type === "user" ? "member" : type, channelType }
          );
          if (result.cancelled) {
            return finish(reasons.ALREADY_ANSWERED);
          }
          subjectToUse = result.subject;
        } else {
          return finish(reasons.BE_MORE_SPECIFIC, `Multiple ${term === "category" ? "categorie" : type}s have matched your \
search. Please be more specific.`);
        }
      }
      if (!subjectToUse) return finish(reasons.NOT_FOUND, capitalize(type) + " not found! :thinking:");
      subject = subjectToUse instanceof GuildMember ? subjectToUse.user : subjectToUse;
    }
  }
  if (!subject) return finish(
    reasons.NOT_FOUND,
    `${capitalize(term)} not found!`
  );
  result.subject = subject;
  return finish(reasons.OK);
}

export default Object.assign(search, { reasons });
