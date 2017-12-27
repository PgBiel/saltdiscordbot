const Command = require("../../classes/command");

const func = async function (msg, { args, reply }) {
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
    answers[this.random(0, answers.length - 1)],
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
