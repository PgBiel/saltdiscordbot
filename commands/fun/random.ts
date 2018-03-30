const Command = require("../../classes/command");
const d = require("../../misc/d");

const func = async function (msg, { arrArgs, reply, guild, perms }) {
  if (guild && !perms.random) return reply("Missing permission `random`! :frowning:");
  if (arrArgs.length < 2) {
    reply("Please specify two numbers.");
    return;
  }
  const result = d.random(
    Number(arrArgs[0]), Number(arrArgs[1]));
  if (result == null) {
    reply("Please specify two **numbers**.");
    return;
  }
  reply(result);
};
module.exports = new Command({
  func,
  name: "random",
  perms: "random",
  default: true,
  description: "Get a random number between two numbers.",
  example: "{p}random 1 10",
  args: {min: false, max: false},
  category: "Fun",
  guildOnly: false
});
