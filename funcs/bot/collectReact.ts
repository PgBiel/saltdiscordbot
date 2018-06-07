import { _, bot, Constants, Discord, Message, Time, TextChannel } from "../../util/deps";
import mkEmj from "../parsers/mkEmoji";
import rejct from "../util/rejct";
import sleep from "../util/sleep";
import customReact from "./customReact";
import { Collection } from "discord.js";

const { MessageReaction } = Discord;
type MessageReaction = Discord.MessageReaction;

interface IResult {
  reason: string;
  results?: MessageReaction[];
  collected?: Discord.Collection<string, MessageReaction>;
  msg?: Message;
}

export type ICollectReactFunc = (res: MessageReaction[], collected: MessageReaction[], msg: Message) => any;

interface IOptions {
  onSuccess?: ICollectReactFunc;
  onTimeout?: ICollectReactFunc;
  timeout?: number;
  rawReact?: boolean;
}

/**
 * React and collect those reactions
 * @param {Message} msg Discord message to react on
 * @param {string[]|string} emojis Emoji(s) to react and listen to
 * @param {string[]|string} validUsers List of users that can react (or one user)
 * @param {object} [options] Options
 * @param {Function} [options.onSuccess=msg.delete()] Function to run when successful reaction
 * @param {Function} [options.onTimeout] Function to run when it timeouts (defaults to remove all reactions)
 * @param {number} [options.timeout=60000] Timeout in milliseconds (defaults to 60000, 0 for no timeout)
 * @param {boolean} [rawReact=false] If should request directly to API to react
 * @returns {Promise<string>} What happened?
 */
function collectReact(
  msg: Message, emojis: string | string[], validUsers: string | string[], {
    onSuccess = funcs.DELETE_MSG, onTimeout = funcs.REMOVE_ALL, timeout = Time.minutes(1),
    rawReact = false
  }: IOptions = {}
): Promise<IResult> {
  return new Promise(async (res, rej) => {
    let stop: boolean = false;
    emojis = _.compact(_.castArray(emojis));
    validUsers = _.compact(_.castArray(validUsers));
    const results: MessageReaction[] = [];
    const collector = msg.createReactionCollector(
      (reaction: MessageReaction, usr) => (
          emojis.includes(reaction.emoji.name)
          || emojis.includes(`<:${reaction.emoji.name}:${reaction.emoji.id}>`)
          || emojis.includes(`${reaction.emoji.name}:${reaction.emoji.id}`)
        ) &&
        (validUsers.length < 1 ? true : validUsers.includes(usr.id)),
      Object.assign({ max: 1 }, timeout >= 0 ? { time: timeout + 1 } : {})
    );
    collector.on("end", async (collected, reason) => {
      stop = true;
      if (reason === "time") {
        if (typeof onTimeout === "function") await onTimeout(results, collected.array(), msg);
        res({
          reason: "time",
          results,
          collected,
          msg
        });
      } else if (/limit/i.test(reason)) {
        if (typeof onSuccess === "function") await onSuccess(results, collected.array(), msg);
        res({
          reason: "collected",
          results,
          collected,
          msg
        });
      } else {
        rej({
          reason,
          results,
          collected,
          msg
        });
      }
    });
    /* let calculatedPing = (bot.pings || [])[0];
    calculatedPing = calculatedPing > 1000 || isNaN(calculatedPing) ? 200 : Number(calculatedPing);
    calculatedPing = calculatedPing + ((calculatedPing || 1000) / 10); */
    const emojiToUse = emojis.map(e => typeof e === "string" && Constants.regex.EMOJI_TEXT.test(e) ?
      mkEmj(e.match(Constants.regex.EMOJI_TEXT)[2], e.match(Constants.regex.EMOJI_TEXT)[1], { isMention: false }) :
      e
    );
    for (let i = 0; i < emojiToUse.length; i++) {
      if (stop) break;
      await sleep(Constants.times.REACT_WAIT);
      const emoji = emojiToUse[i];
      if (rawReact) {
        results.push(await customReact(encodeURIComponent(emojiToUse[i]), msg, false));
      } else {
        results.push(await msg.react(emoji));
      }
    }
  });
}
const funcs = {
  REMOVE_ALL: async (rs: MessageReaction[], _coll: MessageReaction[], msg: Message) => {
    if (
      msg && msg.channel instanceof TextChannel && msg.channel.permissionsFor(msg.guild.me).has(["MANAGE_MESSAGES"])
    ) return msg.reactions.removeAll();
    for (const r of rs) {
      await sleep(Constants.times.REACT_WAIT);
      await r.users.remove();
    }
  },
  DELETE_MSG: (_re: MessageReaction[], _coll: MessageReaction[], msg: Message) => msg.delete()
};

export default Object.assign(collectReact, { funcs });
