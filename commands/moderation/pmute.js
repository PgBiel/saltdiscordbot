const mute = require("./mute");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(mute, "pmute", {
  perms: "mute",
  permanent: true,
  default: false,
  description: "Mute someone, permanently.",
  example: "{p}pmute @Josh#1111 Bad boi",
  args: { user: false, reason: true }
});
