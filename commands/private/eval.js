const { Message } = require("discord.js");
const Command = require("../../classes/command");
const { _, bot, ownerID } = require("../../util/deps");

const func = async (msg, { args, doEval, send, self }) => {
  if (msg.author.id !== ownerID || args.length < 1) {
    return;
  }
  const results = await doEval(args, self);
  const resultStr = String(results.result).replace(
    new RegExp(_.escapeRegExp(bot.token), "ig"), "shaker");
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
