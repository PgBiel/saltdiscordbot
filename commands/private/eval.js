const Command = require("../../classes/command");

const func = async function (msg, { args, doEval, send, self }) {
  if (msg.author.id !== this.ownerID || args.length < 1) {
    return;
  }
  const results = await doEval(args, self);
  const resultStr = String(results.result).replace(
    new RegExp(this._.escapeRegExp(this.bot.token), "ig"), "shaker");
  if (results.success) {
    send(`\`\`\`js
Input
${args}

Output
${resultStr}
\`\`\``);
  } else {
    send(`\`\`\`js
Input
${args}

Error
${resultStr}
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
  devonly: true,
});
