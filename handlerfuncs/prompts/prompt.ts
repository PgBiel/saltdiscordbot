import { Discord, Message, Constants, rejct, User } from "../../misc/d";
import _send from "../senders/send";
import { ExtendedMsgOptions } from "../senders/proto-send";

export interface IBasePromptOptions {
  /**
   * Message to send if we have an invalid input
   */
  invalidMsg: string;
  /**
   * Filter input to see which are valid
   */
  filter: (msg2: Message) => boolean;
  /**
   * Time until it gives up
   */
  timeout?: number;
  /**
   * If should be able to cancel (default: false)
   */
  cancel?: boolean;
  /**
   * If should be able to skip (targetted towards MultiPrompt; default: false)
   */
  skip?: boolean;
  /**
   * Options to use with send()
   */
  options?: ExtendedMsgOptions;
  /**
   * Who should be the prompt target user
   */
  author?: User;
}

export type IPromptOptions = IBasePromptOptions & {
  /**
   * Question to ask
   */
  question: string;
};

export default (msg: Message) => {
  const { Collection } = Discord;
  const { author } = msg;
  return async (
    {
      question, filter, invalidMsg,
      timeout = Constants.times.AMBIGUITY_EXPIRE, cancel = true,
      skip = false, options = {}, author = msg.author
    }: IPromptOptions,
  ) => {
    const send = _send(msg);
    let skipped: boolean = false;
    let cancelled: boolean = false;
    let satisfied: Message = null;
    const filterToUse = (msg2: Message) => {
      if (author && msg2.author.id !== (author.id || author)) return false;
      if (msg2.content.toLowerCase() === "cancel" && cancel) {
        return (cancelled = true);
      }
      if (msg2.content.toLowerCase() === "skip" && skip) {
        return (skipped = true);
      }
      const result: boolean = filter(msg2);
      satisfied = result ? msg2 : null;
      return true;
    };
    const sentmsg = await send(question, options || {});
    for (let i = 0; i < Constants.numbers.max.PROMPT; i++) {
      try {
        const msgs = await msg.channel.awaitMessages(filterToUse, { time: timeout, max: 1, errors: ["time"] });
        if (cancelled || skipped) {
          break;
        }
        if (!satisfied) {
          if (i < Constants.numbers.max.PROMPT) {
            send(invalidMsg);
          } else {
            cancelled = true;
          }
          continue;
        }
        if (satisfied) {
          return { res: satisfied.content, cancelled, skipped };
        }
      } catch (err) {
        if (!(err instanceof Collection)) rejct(err, "{AT PROMPT}");
        cancelled = true;
        break;
      }
    }
    if (!skipped) send("Command cancelled.");
    return { res: "", cancelled, skipped };
  };
};
