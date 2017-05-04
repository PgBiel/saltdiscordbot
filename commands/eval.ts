import { Message } from "discord.js";
import Command from "../classes/command";
import { cmdFunc } from "../commandHandler";
import { _, bot, ownerID } from "../util/deps";

const func: cmdFunc = async (msg: Message, { args, doEval, send }) => {
  if (msg.author.id !== ownerID || args.length < 1) {
    return;
  }
  const results = await doEval(args);
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
${resultStr}`);
  }
};
export const evaler = new Command({
  func,
  name: "eval",
  description: "Evaluate some text.",
  example: "+eval 1 + 1",
  category: "Private",
  guildOnly: false,
  customPrefix: "+",
  devonly: true,
});
