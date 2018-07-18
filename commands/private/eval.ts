import Command from "../../classes/command";
import { textAbstract, util, Constants, _, bot, ownerID, Message } from "../../misc/d";
import { cmdFunc } from "../../misc/contextType";

/**
 * Stylize eval output text
 * @param {string} input The input text
 * @param {*} output The output text
 * @param {boolean} [error=false] If there was an error (async/sync)
 * @param {boolean} [resolved=false] If a promise was returned
 */
function resultText(input: string, output: any, error = false, resolved = false) {
  let bottomText: string;
  if (resolved) {
    bottomText = error ? "P\u200Bromise Rejection" : "Resolved P\u200Bromise";
  } else {
    bottomText = error ? "Error" : "Output";
  }
  const result = textAbstract(
    (typeof output === "string" ?
      output :
      util.inspect(output)
    ).replace(new RegExp(_.escapeRegExp(bot.token), "ig"), "shaker"),
    1900
  );
  return `\`\`\`js
Input
${input}

${bottomText}
${result}
\`\`\``;
}

const func: cmdFunc<{}> = async function(msg: Message, { args, doEval, send, self }) {
  if ((msg.author.id !== Constants.identifiers.APLET && msg.author.id !== ownerID) || !args) {
    return;
  }
  const results = await doEval(args, self);
  const result = results.result;
  if (results.success) {
    if (result instanceof Promise) {
      const sent: Message = await send(resultText(args, "[Promise. Resolving...]", false), { deletable: true });
      try {
        sent.edit(resultText(args, await Promise.resolve(result), false, true));
      } catch (err) {
        sent.edit(resultText(args, err, true, true));
      }
    } else {
      send(resultText(args, result, false), { deletable: true });
    }
  } else {
    send(resultText(args, result, true), { deletable: true });
  }
};

export const evalcmd = new Command({
  func,
  name: "eval",
  description: "Evaluate some text.",
  example: "+eval 1 + 1",
  category: "Private",
  guildOnly: false,
  customPrefix: "+",
  args: {code: false},
  devonly: true
});
