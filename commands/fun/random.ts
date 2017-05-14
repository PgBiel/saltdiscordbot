import { Message } from "discord.js";
import Command from "../../classes/command";
import { cmdFunc } from "../../commandHandler";
import { random } from "../../util/funcs";

const func: cmdFunc = async (msg: Message, { arrArgs, reply }) => {
  if (arrArgs.length < 2) {
    reply("Please specify two numbers.");
    return;
  }
  const result = random(
    Number(arrArgs[0]), Number(arrArgs[1]));
  if (result == null) {
    reply("Please specify two **numbers**.");
    return;
  }
  reply(result);
};
export const randomN = new Command({
  func,
  name: "random",
  perms: "random",
  default: true,
  description: "Get a random number between two numbers.",
  example: "{p}random 1 10",
  args: {min: false, max: false},
  category: "Fun",
  guildOnly: false,
});
