const CommandClient = require("../classes/commandClient");

exports.bot = new CommandClient({
  disableEveryone: true,
  disabledEvents: ["TYPING_START"],
  fetchAllMembers: true
});
