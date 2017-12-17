const { Message } = require("discord.js");
const Command = require("../../classes/command");
const { cmdFunc } = require("../../commandHandler");
const { random } = require("../../util/funcs");

const func = async (msg, { args, reply }) => {
  if (!args) {
    return reply("Please say a question!");
  }
  const answers = [
    "Very probably.",
    "High chance of so.",
    "Sure.",
    "Maybe.",
    "I wouldn't say so.",
    "Low chance of so.",
    "Very unlikely.",
  ];
  reply(
    answers[random(0, answers.length - 1)],
    );
};
module.exports = new Command({
  func,
  name: "8ball",
  perms: "8ball",
  default: true,
  description: "See the answer to your questions...",
  example: "{p}8ball Is chocolate nice?",
  category: "Fun",
  args: {question: false},
  guildOnly: false,
});
