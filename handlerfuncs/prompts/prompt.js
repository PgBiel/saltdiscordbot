const { Discord, Constants, rejct } = require("../../misc/d");
const _send = require("../senders/send");

module.exports = msg => {
  const { Collection } = Discord;
  const { author } = msg;
  return async (
    {
      question, invalidMsg, filter,
      timeout = Constants.times.AMBIGUITY_EXPIRE, cancel = true,
      skip = false, options = {}, author = msg.author
    },
  ) => {
    const send = _send(msg);
    let skipped = false;
    let cancelled = false;
    let satisfied = null;
    const filterToUse = msg2 => {
      if (author && msg2.author.id !== (author.id || author)) return false;
      if (msg2.content.toLowerCase() === "cancel" && cancel) {
        return (cancelled = true);
      }
      if (msg2.content.toLowerCase() === "skip" && skip) {
        return (skipped = true);
      }
      const result = filter(msg2);
      satisfied = result ? msg2 : null;
      return true;
    };
    const sentmsg = await send(question, options || {});
    for (let i = 0; i < Constants.numbers.MAX_PROMPT; i++) {
      try {
        const msgs = await msg.channel.awaitMessages(filterToUse, { time: timeout, max: 1, errors: ["time"] });
        if (cancelled || skipped) {
          break;
        }
        if (!satisfied) {
          if (i < Constants.numbers.MAX_PROMPT) {
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
