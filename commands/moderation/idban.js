const ban = require("./ban");

const Command = require("../../classes/command");

module.exports = Command.aliasFrom(ban, "idban", {
  perms: "ban",
  banType: "idban",
  default: false,
  description: "Ban someone, but using an ID. This allows you to ban people outside the server.",
  example: "{p}idban 80351110224678912 Being b1nzy",
});
