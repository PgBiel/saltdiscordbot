const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, { args, doEval, send, self }) {
  if ((msg.author.id !== d.Constants.identifiers.APLET && msg.author.id !== d.ownerID) || args.length < 1) {
    return;
  }
  const results = await doEval(args, self);
  const resultStr = String(results.result).replace(
    new RegExp(d._.escapeRegExp(d.bot.token), "ig"), "shaker");
  if (results.success) {
    send(`\`\`\`js
Input
${args}

Output
${d.textAbstract(resultStr, 1900)}
\`\`\``);
  } else {
    send(`\`\`\`js
Input
${args}

Error
${d.textAbstract(resultStr, 1900)}
\`\`\``);
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
