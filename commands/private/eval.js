const Command = require("../../classes/command");
const d = require("../../misc/d");

function resultText(input, output, error = false, resolved = false) {
  let bottomText;
  if (resolved) {
    bottomText = error ? "P\u200Bromise Rejection" : "Resolved P\u200Bromise";
  } else {
    bottomText = error ? "Error" : "Output";
  }
  const result = d.textAbstract(
    (typeof output === "string" ?
      output :
      d.util.inspect(output)
    ).replace(new RegExp(d._.escapeRegExp(d.bot.token), "ig"), "shaker"),
    1900
  );
  return `\`\`\`js
Input
${input}
  
${bottomText}
${result}
\`\`\``;
}

const func = async function (msg, { args, doEval, send, self }) {
  if ((msg.author.id !== d.Constants.identifiers.APLET && msg.author.id !== d.ownerID) || !args) {
    return;
  }
  const results = await doEval(args, self);
  const result = results.result;
  if (results.success) {
    if (result instanceof Promise) {
      const sent = await send(resultText(args, "[Promise. Resolving...]", false));
      try {
        sent.edit(resultText(args, await result, false, true));
      } catch (err) {
        sent.edit(resultText(args, err, true, true));
      }
    } else {
      send(resultText(args, result, false));
    }
  } else {
    send(resultText(args, result, true));
  }
};
module.exports = new Command({
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
