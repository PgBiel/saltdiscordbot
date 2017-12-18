const ban = require("./ban");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(ban, "nodelban", {
  perms: "ban",
  default: false,
  description: "Ban someone, but without deleting any of their messages with it.",
  example: "{p}nodelban @EvilGuy#0100 Being evil but not as much",
  days: 0,
});
