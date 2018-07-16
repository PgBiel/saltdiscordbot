import Command from "../../classes/command";
import { cmdFunc } from "../../misc/contextType";

/**
 * Does some insane maths, to determine the response (pseudo-random).
 * @param {string} text The text
 * @param {string} id The ID
 * @param {number} n The amount of possibilities
 * @returns {number} The result
 */
function maths(text: string, id: string, n: number) {
  const charcodes: number[] = text.toUpperCase().split("").filter(a => /[A-Z\d]/.test(a)).map(s => (s.charCodeAt(0)) % n);
  const idd: number = Number(id) % n;
  return (charcodes.reduce((a, b) => a + b, 0) + idd) % n;
}

const func: cmdFunc<{}> = async function(msg, { args, reply, guild, author, perms }) {
  if (!args) {
    return reply("Please ask a question!");
  }
  if (guild && !perms["8ball"]) return reply("Missing permission `8ball! :frowning:");
  const answers: string[] = [
    "Very probably.",
    "High chance of so.",
    "Sure.",
    "Maybe.",
    "I wouldn't say so.",
    "Low chance of so.",
    "Very unlikely."
  ];
  reply(
    answers[/* d.random(0, answers.length - 1) */maths(args, author.id, answers.length)],
    );
};
export const eightball = new Command({
  func,
  name: "8ball",
  perms: "8ball",
  default: true,
  description: "See the answer to your questions...",
  example: "{p}8ball Is chocolate nice?",
  category: "Fun",
  args: {question: false},
  guildOnly: false
});
