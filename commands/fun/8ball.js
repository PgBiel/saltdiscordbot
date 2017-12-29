const Command = require("../../classes/command");

/**
 * Does some insane maths.
 * @param {string} text The text
 * @param {string} id The ID
 * @param {number} n The amount of possibilities
 * @returns {number} The result
 */
function maths(text, id, n) {
  const charcodes = text.toUpperCase().split("").filter(a => /[A-Z\d]/.test(a)).map(s => (s.charCodeAt(0)) % n);
  const idd = Number(id) % n;
  return (charcodes.reduce((a, b) => a + b, 0) + idd) % n;
}

const func = async function (msg, { args, reply, author }) {
  if (!args) {
    return reply("Please ask a question!");
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
    answers[/* this.random(0, answers.length - 1) */maths(args, author.id, answers.length)],
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
