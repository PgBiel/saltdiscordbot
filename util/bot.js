const CommandClient = require("../classes/commandClient");

const bot = new CommandClient({
  disableEveryone: true,
  disabledEvents: ["TYPING_START"],
  fetchAllMembers: true
});
bot.bot = bot;

module.exports = bot;
