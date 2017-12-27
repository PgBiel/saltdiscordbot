const help = require("./help");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(help, "mhelp", {
  mobile: true,
  default: true,
  description: "Same as `help`, but doesn't show an ASCII table on the category list. Designed for mobile users.",
  example: "{p}mhelp\n{p}mhelp 8ball\n{p}mhelp fun",
});
