import { Message } from "discord.js";
import Command from "../classes/command";
import { cmdFunc } from "../commandHandler";
import { random } from "../util/funcs";

const func: cmdFunc = async (msg: Message, { args, reply }) => {
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
export const eightball = new Command({
  func,
  name: "8ball",
  description: "See the answer to your questions...",
  example: "{p}8ball Is chocolate nice?",
  category: "Fun",
  args: {question: false},
  guildOnly: false,
});
